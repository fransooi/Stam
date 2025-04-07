call npm run build
rmdir /s /q d:\Awi-Data\public\stam\*.* 
xcopy /E /Y .\dist\*.* d:\Awi-Data\public\stam\
