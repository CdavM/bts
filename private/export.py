#! /usr/bin/env python

import subprocess
 
text = subprocess.check_output("meteor mongo --url btsturk.meteor.com", shell=True)

client_value = text[10:25]
password_value = text[26:62]
host_value = text[63:95]
d_value = text[96:-1]

result = "mongoexport -u " + client_value + " -h " + host_value + " -d " + d_value + " -p " + \
		 password_value + " --csv -c answers -f 'worker_ID','answer1','percentages','initial_time','time_difference','payments','avg_payment' -o export.csv"
subprocess.call(result, shell=True)