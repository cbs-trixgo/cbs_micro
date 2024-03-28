__FILE NAME__ | __DESCRIPTION__
----------|-------------
1/ __*.service.js__ | định nghĩa service (map ___ROUTES___ -> ___ACTIONS___)
2/ __handler__/*.-handler.js  | các function thực hiện call vào server
3/ __model__/*.-model.js | các method model
4/ __database__/*.-model.js | các method model
5/ __helper__/*.routes-constant.js | Danh sách ROUTES của service
   __helper__/*.actions-constant.js | Danh sách các ACTIONS từ hệ thống
   __helper__/*.events-constant.js | Danh sách EVENT BUS(implement RabbitMQ)
   __helper__/*.keys-constant.js  | Danh sách variable config || constant của service

