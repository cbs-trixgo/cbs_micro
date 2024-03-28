| **FILE NAME**                       | **DESCRIPTION**                                        |
| ----------------------------------- | ------------------------------------------------------ | --- | -------------------- |
| 1/ **\*.service.js**                | định nghĩa service (map **_ROUTES_** -> **_ACTIONS_**) |
| 2/ **handler**/\*.-handler.js       | các function thực hiện call vào server                 |
| 3/ **model**/\*.-model.js           | các method model                                       |
| 4/ **database**/\*.-model.js        | các method model                                       |
| 5/ **helper**/\*.routes-constant.js | Danh sách ROUTES của service                           |
| **helper**/\*.actions-constant.js   | Danh sách các ACTIONS từ hệ thống                      |
| **helper**/\*.events-constant.js    | Danh sách EVENT BUS(implement RabbitMQ)                |
| **helper**/\*.keys-constant.js      | Danh sách variable config                              |     | constant của service |
