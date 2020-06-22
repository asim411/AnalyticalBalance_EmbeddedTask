# AnalyticalBalance_EmbeddedTask
Task for LabForward

device.js Usage:

node device.js <args>
args: 
   <Lower Range> Lower measurement range of the device. (float)
   <Upper Range> Upper measurement range of the device. (float) 
   <Readability> Smallest devision the device is capable of measuring. (float)
   <Actual weight> Actual weight of the mass. (float) 
   <Door Function> Door function (automatic or manual)
   <Current Door Status> Current door position. (open or close)
   <timeout> Time to wait for stable value before a timing out on a command. (seconds)
   <Settling TIme> Time taken by the device to arrive at a stable value. (seconds)
   <Set current Unit> Current weight unit. (lb, g, etc) default is g.

Example commands:
>node device.js 0.016 52 0.005 7 automatic open 4 2 lb  
>node device.js 0.02 20 0.1 12 automatic close 3 1  
>node device.js 1 35 0.01 22 manual close 4 3 g  



driver.js Usage:

node driver.js <args>
args: 
   <S\n> Send stable weight value. (Note: make sure to add newline character at the end).
   <SU\n> Send stable weight value in actually displayed unit. (Note: make sure to add newline character at the end).

Example commands:
>node driver.js 'S  
>'  
>node driver.js 'SU  
>'  