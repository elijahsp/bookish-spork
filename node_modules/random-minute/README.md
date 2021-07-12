# random-minute

> Generate a random minute.

[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/mock-end/random-minute/blob/master/LICENSE)
  
[![build:?](https://img.shields.io/travis/mock-end/random-minute/master.svg?style=flat-square)](https://travis-ci.org/mock-end/random-minute)
[![coverage:?](https://img.shields.io/coveralls/mock-end/random-minute/master.svg?style=flat-square)](https://coveralls.io/github/mock-end/random-minute)
  
  
## Install
  
```
$ npm install --save random-minute 
```
  
## Usage
  
```js
var randomMinute = require('random-minute');
  
// API
// - randomMinute([options]);
  
// options
// - min
// - max
```

By default, returns a minute from `0` to `59`. Idea is for generating a clock time.
  
```js
randomMinute();
// => 37
```

Optionally specify min, max, or both to limit the range.

```js
randomMinute({ min: 10 });
// => 18

randomMinute({ max: 40 });
// => 23

randomMinute({ min: 10, max: 40 });
// => 32
```
  
## Related
  
- [random-year](https://github.com/mock-end/random-year) - Generate a random year.
- [random-month](https://github.com/mock-end/random-month) - Generate a random month.
- [random-day](https://github.com/mock-end/random-day) - Generate a random day of a month.
- [random-hour](https://github.com/mock-end/random-hour) - Generate a random hour.
- [random-second](https://github.com/mock-end/random-second) - Generate a random second.
- [random-millisecond](https://github.com/mock-end/random-millisecond) - Generate a random millisecond.
- [random-weekday](https://github.com/mock-end/random-weekday) - Generate a random weekday.
- [random-datetime](https://github.com/mock-end/random-datetime) - Generate a random date. 
- [random-ampm](https://github.com/mock-end/random-ampm) - Return am or pm. Very simple.
- [random-timestamps](https://github.com/mock-end/random-timestamps) - Generate a timestamp. 
- [random-hammertime](https://github.com/mock-end/random-hammertime) - Generate a random hammertime. 
  

## Contributing
  
Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/mock-end/random-minute/issues/new).
