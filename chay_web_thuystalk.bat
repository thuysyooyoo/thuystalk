@echo off
chcp 65001 >nul
title ThuysTalk Website & Google NotebookLM (/notebook) Bridge
cd /d "d:\AI AGENT THUY\AI branding\website_thuystalk"
echo ======================================================================
echo DANG KHOI DONG WEBSITE THUYSTALK VA KET NOI GOOGLE NOTEBOOKLM...
echo Dia chi truy cap: http://localhost:8099
echo ======================================================================
python server_thuystalk.py
pause
