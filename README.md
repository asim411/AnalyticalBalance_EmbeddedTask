# AnalyticalBalance_EmbeddedTask

## Table of contents
* [Introduction](#introduction)
* [Device](#device)
* [Driver](#driver)

## Introduction

As an example, the analytical balance from ![Mettler_Tolledo_Analytical Balance](https://www.mt.com/us/en/home/products/Laboratory_Weighing_Solutions/Analytical/Excellence.html) is considered. A script for the driver and device is written in nodejs. 

### Device

Device is the analytical balance and the script for device is used to configure the device by passing the configuration parameters like min and max weighing capacity, accuracy and precision, settling time and others as mentioned in the usage section. The configuration/initialization parameters for the device are taken from the ![Analytical_Balance_Datasheet](https://github.com/asim411/AnalyticalBalance_EmbeddedTask/blob/master/MT_AnalyticalBalance_Pdf/DataSheet_MT_AnalyticalBalance.pdf). 


#### device.js Usage:
\
node device.js \<args\>\
args: \
   \<Lower Range\> Lower measurement range of the device. (float)\
   \<Upper Range\> Upper measurement range of the device. (float) \
   \<Readability\> Smallest devision the device is capable of measuring. (float)\
   \<Actual weight\> Actual weight of the mass. (float) \
   \<Door Function\> Door function (automatic or manual)\
   \<Current Door Status\> Current door position. (open or close)\
   \<timeout\> Time to wait for stable value before a timing out on a command. (seconds)\
   \<Settling TIme\> Time taken by the device to arrive at a stable value. (seconds)\
   \<Set current Unit\> Current weight unit. (lb, g, etc) default is g.\

\
Example commands:
>node device.js 0.016 52 0.005 7 automatic open 4 2 lb\
>node device.js 0.02 20 0.1 12 automatic close 3 1\
>node device.js 1 35 0.01 22 manual close 4 3 g

### Driver

Driver is communicating with device. Commands mentioned in the task document are programmed in driver script. To get a better understanding of the device interface, commands and their usage mentioned in ![Analytical_Balance_Interface Commands](https://github.com/asim411/AnalyticalBalance_EmbeddedTask/blob/master/MT_AnalyticalBalance_Pdf/InterfaceCommands_MT_AnalyticalBalance.pdf) also helped a lot. The usage of the script is as below:

#### driver.js Usage:
\
node driver.js \<args\>\
args:\
   \<S\\n\> Send stable weight value. (Note: make sure to add newline character at the end).\
   \<SU\\n\> Send stable weight value in actually displayed unit. (Note: make sure to add newline character at the end).\
\
Example commands:
>node driver.js 'S\
>'\
>node driver.js 'SU\
>'
