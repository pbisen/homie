

import csv

def read_csv(filename):
    with open(filename, 'r') as f:
        reader = csv.reader(f)
        return list(reader)
    
def main():
    file2 = read_csv('old-jenkins.csv')
    file1 = read_csv('new-jenkins.csv')
    for row in file2:
        if row[0] not in file1:
            print(row[0])
