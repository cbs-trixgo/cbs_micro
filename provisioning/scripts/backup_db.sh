#!/bin/sh

#Xóa dữ liệu hiện tại của thư mục hiện tại
rm -rf /opt/cbs_micro/provisioning/scripts/auto_backup_db/*

DIR=`date +%Y%m%d_%H%M%S`
DEST=/opt/cbs_micro/provisioning/scripts/auto_backup_db/$DIR

SOURCECODE=/opt/cbs_micro

mkdir $DEST
mongodump --db cbs_official -u admin_cbs -p dAGT5ttW6CLrsTuw -h ip-172-31-24-73.ap-southeast-1.compute.internal -o $DEST

#FILE_ZIP=$SOURCECODE node ./upload_drive.js
FILE_ZIP=$DIR node /opt/cbs_micro/provisioning/scripts/upload_drive.js
