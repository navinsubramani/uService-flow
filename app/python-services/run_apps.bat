@echo off

rem Start the first Flask app (Seismometers.py) in the first terminal window
start "Seismometers" cmd /c "set FLASK_APP=Seismometers.py && set FLASK_RUN_PORT=5051 && flask run"

rem Pause for a short time to allow the first app to start before starting the second app
ping 127.0.0.1 -n 3 > nul

rem Start the second Flask app (Web_Waveform_Viewer.py) in the second terminal window
start "Web Waveform Viewer" cmd /c "set FLASK_APP=Web_Waveform_Viewer.py && set FLASK_RUN_PORT=5071 && flask run"
