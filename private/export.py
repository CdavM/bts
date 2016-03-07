#! /usr/bin/env python

import subprocess
print("Connecting to the server database...")
try:
	text = subprocess.check_output("meteor mongo --url purple.meteor.com", shell=True)
	print("Successfully connected.")
except:
	print("Connection failed.")
	print("Exiting script.")
	exit()


client_value = text[10:25]
password_value = text[26:62]
host_value = text[63:95]
d_value = text[96:-1]

result = "mongoexport -u " + client_value + " -h " + host_value + " -d " + d_value + " -p " + \
		 password_value + " --csv -c answers -fieldFile exportfields.txt -q '{initial_time: {$gt: 1423860050733}}' -o export.csv"
print("Initiating export...")
subprocess.call(result, shell=True)

#'worker_ID,answer1,initial_time,begin_time'
