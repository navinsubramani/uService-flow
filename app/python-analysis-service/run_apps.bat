@echo off

rem Start the first Flask app (Seismometers.py) in the first terminal window
start "noise_filter" cmd /c "set FLASK_APP=noise_filter.py && set FLASK_RUN_PORT=5061 && flask run"

rem Pause for a short time to allow the first app to start before starting the second app
ping 127.0.0.1 -n 3 > nul

