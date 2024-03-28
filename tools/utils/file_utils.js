"use strict";

const fs                = require('fs');
let promise             = require('bluebird');
// const compress_images   = require('compress-images');
const Path              = require('path');
const mkdirP            = require('mkdirp');
const PROJECT_PATH      = `${process.cwd()}/storage/`;

exports.uploadFile = function (file, path, args, callback) {
    file.mv(path, function (err) {
        if (err) {
            callback(false, args);
        } else {
            callback(true, args);
        }
    });
};

exports.baseUploadImageCode = function (code, path) {
    return new promise(function (resolve, reject) {
        fs.writeFile(path, code.replace(/^data:image\/\w+;base64,/, ''), {encoding: 'base64'}, function (err) {
            fs.chmod(path, '0777');
            return resolve({error: false, message: 'Upload success'});
        });
    });
};

exports.baseUploadImageFile = function (file, path) {
    return new promise(function (resolve, reject) {
        if (file == null) {
            return resolve({error: true, message: 'File not found'});
        } else {
            file.mv(path, function (err) {
                if (err) {
                    return resolve({error: true, message: 'File does not upload'});
                } else {
                    return resolve({error: false, message: 'Upload success'});
                }
            });
        }
    });
};

exports.checkAndCreateFolder = function (path) {
    let incs = path.split("/");
    let baseBath = '';
    incs.forEach(function (inc, index) {
        if (inc.trim() != "") {
            baseBath = baseBath + '/' + inc.trim();
            if (!fs.existsSync(baseBath)) {
                fs.mkdirSync(baseBath, '0777');
            }
        }
    });
    return baseBath;
};

const checkAndCreateFolder__WINDOWS = path => {
    let madePath = mkdirP.sync(path);
}

const checkExistFolder = function (folderPath) {
    return fs.existsSync(folderPath);
}

const deleteFolderRecursive = function (path) {
    if (fs.existsSync(Path.normalize(path))) {
        fs.readdirSync(path).forEach((file, index) => {
            const curPath = Path.join(path, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(Path.normalize(curPath));
            }
        });
        fs.rmdirSync(Path.normalize(path));
    }
};

const deleteFile = function (path) {
    fs.exists(path, function (exists) {
        if (exists) {
            fs.unlinkSync(path);
        }
    });
};

function deleteFiles(){
    let directory = path.resolve(__dirname, '../../files/temp/users/');
    fs.readdir(directory, (err, files) => {
        if (err) console.log({ err }) ;
        for (const file of files) {
            let pathImage = path.join(directory, file);
            if (fs.existsSync(pathImage)) {
                fs.unlink(pathImage, err => {
                    if (err) console.log({ err }) ;
                })
            }
        }
    });
}

// Chỉ cho phép upload images, audios, files (zip)
exports.uploadFilter = function(req, file, cb) {
    const message = 'cannot_upload_file';
    //Kiểm tra đuôi file
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|mp3|MP3|mp4|MP4|wav|WAV|zip|ZIP|xls|XLS|xlsx|XLSX|xlsm|XLSM|doc|DOC|docx|DOCX|dwg|DWG|txt|TXT)$/)) {
        // req.fileValidationError = true;
        // return cb(message, false);
        req.fileValidationError = true;
        return cb(null, false, req.fileValidationError);
    }
    
    //Kiểm tra mime type
    // let mimetypeSuccess = ['image/jpeg', 'image/pjpeg', 'image/png', 'application/zip', 'application/x-rar-compressed'
    //                             ,'audio/mp4', 'video/mp4', 'application/mp4', 'audio/mpeg', 'application/x-zip-compressed'];
    // if(!mimetypeSuccess.includes(file.mimetype)) {
    //     // req.fileValidationError = true;
    //     // return cb(message, false);
    //     req.fileValidationError = true;
    //     return cb(null, false, req.fileValidationError);
    // }
    cb(null, true);
};

// let COMPRESS_IMAGE = (imagePathTemp, outputPath) => {
//     // console.log(`----compressing IMAGE_SINGLE ->>>`);
//     // console.log({ imagePathTemp, outputPath })
//     // console.log(`----compressing IMAGE_SINGLE ->>>`);
//     compress_images(imagePathTemp, `${outputPath}/`, {compress_force: false, statistic: true, autoupdate: true}, false,
//         {jpg: {engine: 'mozjpeg', command: ['-quality', '70']}},
//         {png: {engine: 'pngquant', command: ['--quality=20-50']}},
//         {svg: {engine: 'svgo', command: '--multipass'}},
//         {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){
//             // console.log(`----> COMPRESS SUCESS ${imagePathTemp}`)
//             // let infoUnlink = await unlinkImage(imagePathTemp);
//             // console.log({ infoUnlink })
//             deleteFile(imagePathTemp);
//         });
// }

// let _COMPRESS_IMAGE = (imagePathTemp, outputPath) => {
//     return new Promise(async resolve => {
//         compress_images(imagePathTemp, `${outputPath}/`, {compress_force: false, statistic: true, autoupdate: true}, false,
//         {jpg: {engine: 'mozjpeg', command: ['-quality', '70']}},
//         {png: {engine: 'pngquant', command: ['--quality=20-50']}},
//         {svg: {engine: 'svgo', command: '--multipass'}},
//         {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(err, completed, statistic){
//             console.log({ err, completed, statistic })
//             if (err)
//                 return resolve({ error: true, message: 'cannot_compress' });
//             deleteFile(imagePathTemp);
//             if(completed == true){
//                 return resolve({ error: false, message: 'compress_success' });
//             }
//         });
//     })
// }

function deleteFiles(){
    let directory = path.resolve(__dirname, '../../files/temp/users/');
    fs.readdir(directory, (err, files) => {
        if (err) console.log({ err }) ;
        for (const file of files) {
            let pathImage = path.join(directory, file);
            if (fs.existsSync(pathImage)) {
                fs.unlink(pathImage, err => {
                    if (err) console.log({ err });
                })
            }
        }
    });
}

// exports.COMPRESS_MULTI_IMAGES = (inputFolderPath, outputPath) => {
// const INPUT_path_to_your_images = `${inputFolderPath}/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}`;
// compress_images(INPUT_path_to_your_images, `${outputPath}/`, {compress_force: false, statistic: true, autoupdate: true}, false,
//     {jpg: {engine: 'mozjpeg', command: ['-quality', '70']}},
//     {png: {engine: 'pngquant', command: ['--quality=20-50']}},
//     {svg: {engine: 'svgo', command: '--multipass'}},
//     {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, async function(err){
//         deleteFiles();
//         console.log({ err })
//     });
// }

module.exports = {
    checkAndCreateFolder__WINDOWS,
    checkExistFolder,
    deleteFolderRecursive,
    deleteFile,
    // COMPRESS_IMAGE: _COMPRESS_IMAGE
};
