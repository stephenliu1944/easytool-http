# Mock Server
该服务用于快速生成模拟数据.

## 特性
- 模拟数据
- 模拟文件下载
- 通过请求的 URL 和 method 匹配响应信息
- 自定义响应延迟时间, 状态码, 头信息
- 支持第三方数据模拟库, 如 Mock.js 和 Faker.js

## 安装
```
git clone https://github.com/stephenliu1944/mock-server.git
cd mock-server
npm install
```

## 使用
### 1. 设置服务端口号
package.json
```js
"devEnvironments": {
    "servers": {
        "mock": 3000    // 默认
    },
    ...
},
```

### 2. 设置模拟数据
默认的 mock 数据存放路径为 "/mock/data", 可以在 "/mock/settings.js" 中进行修改.
```js
module.exports = [{
    // 根据请求条件匹配响应信息
    request: {
        url: '/user/:id'
    },
    // 用于返回的响应信息
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            age: 30
        }
    }
}];
```

### 3. 启动服务
```js
npm start
```
或执行
```js
/bin/start.bat   // Windows
/bin/start.sh    // Linux
```

### 4. 请求URL
```js
http://localhost:3000/user/1
```

## 配置
### 数据格式
可以添加任何js文件或文件夹到"/mock/data"目录, 服务器会递归查询(采用深度优先查找).
```js
{
    // 'request' 用于匹配请求, 根据请求返回对应的响应信息
    request: {  
        // 'url' 用于对比请求的URL.
        url: '/xxx/xxx',        // 必填
        // 'method' 用于 对比请求的方法, 不填则不会对比该项.
        method: 'get'           // 可选
    },
    // 'response' 用于配置响应返回的信息.
    response: {             // 必填
        // 'delay' 用于设置响应的延迟时间, 默认为0毫秒.
        delay: 0,           // 默认
        // 'status' 用于设置响应的状态码, 默认为200.
        status: 200,        // 默认
        // 'headers' 用于设置响应的头信息, 下方是默认配置.
        headers: {          // 默认
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        // 'body' 用于配置响应的实体信息, 支持 string, object, array类型, 如果类型为 String 并且以 '.xxx' 后缀结尾, 则表示该配置项为一个文件路径, 且默认根目录为 "/mock/resources",该功能用于返回文件, 可以在 "/mock/settings.js" 中修改默认配置.
        body: {             // 必填
            ...
        }
    }
}
```

### 路由
```js
{
    request: {
        // 匹配 /user/stephen 和 /user/ricky
        url: '/user/:name',
        // 匹配 /files/hello.jpg 和 /files/world.png
        url: '/files/*.*',  
        // 匹配 /files/hello.jpg 和 /files/path/to/world.jpg
        url: '/**/*.jpg'
    },
    ...
}
```

### 默认设置
可以在 "/mock/settings.js" 中修改默认配置.
```js
{
    // 全局的响应配置, 会合并到你指定的某个具体的响应配置上.
    response: {
        headers: {                      // 默认
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
    },
    // mock 数据的文件保存目录
    dataPath: '/data',              // 默认
    // 保存响应返回的文件目录
    resourcesPath: '/resources',    // 默认
    // 遍历搜索匹配的 mock 文件的顺序, 默认按字母排序.
    sort(filenames) {
        return filenames.sort();    // 默认
    }
}
```

## 示例
### 模拟接口数据
GET http://localhost:3000/user/list
```js
module.exports = [{
    request: {
        url: '/user/list',
        method: 'get'
    },
    response: {
        delay: 2000,
        body: [{
            id: 123,
            name: 'Stephen',
            age: 30
        }, {
            id: 124,
            name: 'Ricky',
            age: 20
        }]
    }
}];
```

### 模拟文件下载
POST http://localhost:3000/download/sample
```js
module.exports = [{
    request: {
        url: '/download/:filename',
        method: 'get'
    },
    response: {
        delay: 1000,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment;filename=sample.txt;'
        },
        body: 'sample.txt'      // 需要将模拟下载的文件保存在 '/mock/resources' 目录中.
    }
}];
```

### 使用 Mock.js 库
```js
npm i mockjs
```
GET http://localhost:3000/user/list
```js
var Mock = require('mockjs');

module.exports = [{
    request: {
        url: '/user/list',
        method: 'get'
    },
    response: {
        body: Mock.mock({
            'data|20': [{
                id: '@integer(0, 10000)',
                name: '@name',
                email: '@email'
            }]
        }).data
    }
}];
```
[Mock.js API](https://github.com/nuysoft/Mock/wiki)

### 使用 Faker.js 库
```js
npm i faker
```
GET http://localhost:3000/user/123  
```js
var faker = require('faker');

module.exports = [{
    request: {
        url: '/user/:id',
        method: 'get'
    },
    response: {
        body: {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            email: faker.internet.email()
        }
    }
}];
```
[Faker.js API](https://github.com/Marak/Faker.js#readme)