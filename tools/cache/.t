thư mục lưu trữ các function local-cache (in-memory persistence DB)
- [list.js] -> list data-type structure of REDIS 
    * use_cases:
        - LatestAccessing
        - Social Networking Sites: Populate Timelines + Homepage feeds -> Tweets or Stories
    * Implementations:
        1/ Top 5 Departments        | Latest Access
        2/ Top 10 Task              | Latest Access
- [set.js] -> Set
    * use_case:
        - Analyzing Ecommence Sales: Analyze customer Behaviors such as: Searching, Purchase -> product/category
        - ID Address Tracking: -> ignore duplicate IP -> SADD functions
- [sortset.js] -> SortSet: LeaderBoard 
    * use_case: 
        - helpful TOP with SCORE
        - Q&A Platform: Sorted Sets to Ranks HIGHEST voted answers
        - Top Gaming with Score
        - Task Scheduling Service: priority rank task (of queue)
    * Implementations:
        1/ ...
- [string.js] -> String
    * use_case:
        - session
        - full page cache (convert double "" -> single '')
- [hash.js] -> hash (encoded efficiently) #https://divinglaravel.com/introduction-to-redis-hashes
    * use_case;
        - UserProfile: SINGLE_HASH -> all info(fields) user_profile
        - UserPost: social platforms use HASHes map: all post relative -> one USER
        - Multi-tenant Application: (dạng bán hàng như Shoppe -> có nhiều người bán hàng)
            + problems: theo dõi được thông số bán hàng của từng shop/từng sản phẩm
            + performance: (Instagram Enginering) -> set(string): shop:{shopId}:product:{productId}:sales
                + Having 1 Million string keys needed about 70MB of memory
                + Having 1000 Hashes each with 1000 Keys only needed 17MB!
        - COMMAND:
            1/ Redis::hmset("shop:{$shopId}:sales", "product:1", 100, "products:2", 400);
            2/ Redis::hget("shop:{$shopId}:sales", 'product:1');
            3/ Redis::hmget("shop:{$shopId}:sales", 'product:1', 'product:2'); 
            4/ Redis::hvals("shop:{$shopId}:sales");
            5/ Redis::hgetall("shop:{$shopId}:sales");

            ---Incrementing & Decrementing---
            6/ Redis:hincrby("shop:{$shopId}:sales", "product:1", 18);
            7/ Redis:hincrbyfloat("shop:{$shopId}:sales", "product:1", 18.9);

            ---field existence---
            8/ Redis::hexists("shop:{$shopId}:sales", "product:1");
            9/ Redis::hsetnx("shop:{$shopId}:sales", "product:1");//set if NotExist (~nx)

            ---other operations---
            10/ Redis::hdel("shop:{$shopId}:sales", "product:1", "product:2");
            11/ Redis::hstrlen("shop:{$shopId}:sales", "product:1");
        - TRADES-OF
            + giảm bổ nhớ hơn gấp 5 lần
            + nhưng tăng CPU (có thể gọi là Performance CPU-Intensive) => vì đây là hàm băm

            + mặc định, HASHes có cấu hình ENCODED khi  
                1/ chứa ít hơn 512 field (keys)
                            hoặc 
                2/ giá trị lớn nhất LƯU TRÊN 1 FIELD có độ dài nhỏ hơn 64

                =>  Redis::config('set', 'hash-max-zipmap-entries', 1000);
                    // Sets the maximum number of fields before the hash stops being encoded: 512 -> 1000

                =>  Redis::config('set', 'hash-max-zipmap-value', 128);
                    // Sets the maximum size of a hash field before the hash stops being encoded: length 64 -> 128
    
- [hyperloglog.js] -> hyperloglog
    * use_case:
        - everything about count
    * implementations:
        - Count user account Routing