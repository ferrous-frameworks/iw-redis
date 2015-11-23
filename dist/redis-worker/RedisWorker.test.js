///<reference path='../typings/master.d.ts' />
var chai = require('chai');
var expect = chai.expect;
var async = require('async');
var _ = require('lodash');
var redis = require('redis');
var ironworks = require('ironworks');
var Service = ironworks.service.Service;
var EnvironmentWorker = ironworks.workers.EnvironmentWorker;
var RedisWorker = require('./RedisWorker');
var s;
var prefix = 'iw-redis-test-';
var test = {
    some: 'data'
};
describe('iw-redis', function () {
    beforeEach(function (done) {
        s = new Service('redis-test-service')
            .use(new EnvironmentWorker('test', {
            genericConnections: [{
                    name: 'test-redis-service',
                    host: '127.0.0.1',
                    port: '6379',
                    type: 'redis'
                }, {
                    name: 'test-sql-service',
                    host: '0.0.0.0',
                    port: '0',
                    type: 'sql'
                }]
        }))
            .use(new RedisWorker());
        s.info('ready', function () {
            s.check('iw-redis.del-pattern', prefix + '*', function (e) {
                expect(e).to.be.null;
                done();
            });
        });
        s.start();
    });
    it("should be able to set a redis key", function (done) {
        async.waterfall([
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.get', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to get a redis key", function (done) {
        async.waterfall([
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.get', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be return null when getting a redis key that isn't set", function (done) {
        s.request('iw-redis.get', prefix + 'null-test', function (e, res) {
            expect(e).to.be.null;
            expect(res).to.be.equal(null);
            done();
        });
    });
    it("should be able to delete a redis key", function (done) {
        async.waterfall([
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.del', prefix + 'set-test', function (e, res) {
                    expect(res).to.be.equal(1);
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.get', prefix + 'set-test', function (e, res) {
                    expect(res).to.be.null;
                    expect(e).to.be.null;
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to delete all redis keys that match a pattern", function (done) {
        async.waterfall([
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test1',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test2',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.check('iw-redis.del-pattern', prefix + '*', function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.keys', prefix + '*', function (e, res) {
                    expect(res.length).to.be.equal(0);
                    expect(e).to.be.null;
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to set multiple fields on a redis hash", function (done) {
        async.waterfall([
            function (cb) {
                s.request('iw-redis.hmset', {
                    key: prefix + 'set-test',
                    value: test
                }, function (e, res) {
                    expect(res).to.be.equal('OK');
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.hgetall', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to get all the fields on a redis hash", function (done) {
        async.waterfall([
            function (cb) {
                s.request('iw-redis.hmset', {
                    key: prefix + 'set-test',
                    value: test
                }, function (e, res) {
                    expect(res).to.be.equal('OK');
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.hgetall', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to add a redis set", function (done) {
        async.waterfall([
            function (cb) {
                s.request('iw-redis.sadd', {
                    key: prefix + 'set-test',
                    value: JSON.stringify(test)
                }, function (e, res) {
                    expect(res).to.be.equal(1);
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.smembers', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.length).to.be.equal(1);
                    var obj = JSON.parse(res[0]);
                    expect(obj.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to get all the members of a redis set", function (done) {
        async.waterfall([
            function (cb) {
                s.request('iw-redis.sadd', {
                    key: prefix + 'set-test',
                    value: JSON.stringify(test)
                }, function (e, res) {
                    expect(res).to.be.equal(1);
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.smembers', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.length).to.be.equal(1);
                    var obj = JSON.parse(res[0]);
                    expect(obj.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to remove an element from a redis set", function (done) {
        async.waterfall([
            function (cb) {
                s.request('iw-redis.sadd', {
                    key: prefix + 'set-test',
                    value: JSON.stringify(test)
                }, function (e, res) {
                    expect(res).to.be.equal(1);
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.srem', {
                    key: prefix + 'set-test',
                    value: JSON.stringify(test)
                }, function (e, res) {
                    expect(res).to.be.equal(1);
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.smembers', prefix + 'set-test', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.length).to.be.equal(0);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to get all redis keys that match a pattern", function (done) {
        async.waterfall([
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test1',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.check('iw-redis.set', {
                    key: prefix + 'set-test2',
                    value: test
                }, function (e) {
                    expect(e).to.be.null;
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.keys', prefix + '*', function (e, res) {
                    expect(e).to.be.null;
                    expect(res.length).to.be.equal(2);
                    expect(_.contains(res, prefix + 'set-test1')).to.be.true;
                    expect(_.contains(res, prefix + 'set-test2')).to.be.true;
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to push a value onto the left side of a list and provide a block right pop to retrieve the value", function (done) {
        var listKey = prefix + 'lpush-brpop-test';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.lpush', {
                    key: listKey,
                    value: test
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res).to.be.equal(1);
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.brpop', {
                    key: listKey
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res.list).to.be.equal(listKey);
                    expect(res.value.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should be able to push a value onto the right side of a list and provide a block left pop to retrieve the value", function (done) {
        var listKey = prefix + 'rpush-blpop-test';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.rpush', {
                    key: listKey,
                    value: test
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res).to.be.equal(1);
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.blpop', {
                    key: listKey
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res.list).to.be.equal(listKey);
                    expect(res.value.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should timeout if blocking pop exceeds the given timeout in seconds", function (done) {
        var listKey = prefix + 'rpush-blpop-test-timeout';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.blpop', {
                    key: listKey,
                    timeoutInSeconds: 1
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res.list).to.be.null;
                    expect(res.value).to.be.null;
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should return the first value added to any list if key is an array", function (done) {
        var listKeyPrefix = prefix + 'multi-list-pop-test|';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.rpush', {
                    key: listKeyPrefix + '1',
                    value: test
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res).to.be.equal(1);
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.blpop', {
                    key: [listKeyPrefix + '1', listKeyPrefix + '2']
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res.list).to.be.equal(listKeyPrefix + '1');
                    expect(res.value.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should return the first value added to any list if key is a csv", function (done) {
        var listKeyPrefix = prefix + 'multi-list-pop-test|';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.rpush', {
                    key: listKeyPrefix + '1',
                    value: test
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res).to.be.equal(1);
                    cb(e);
                });
            },
            function (cb) {
                s.request('iw-redis.blpop', {
                    key: [listKeyPrefix + '1', listKeyPrefix + '2'].join(',')
                }, function (e, res) {
                    expect(e).to.be.null;
                    expect(res.list).to.be.equal(listKeyPrefix + '1');
                    expect(res.value.some).to.be.equal(test.some);
                    cb(e);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should inform the 'message-[channel name]' event when a subscribed channel receives a publish message", function (done) {
        var channel = prefix + 'test-channel';
        s.info('iw-redis.message-' + channel, function (data) {
            expect(data.some).to.be.equal(test.some);
            done();
        });
        s.request('iw-redis.subscribe', channel, function (e, channelName) {
            expect(e).to.be.null;
            expect(channelName).to.be.equal(channel);
            var anotherRedisClient = redis.createClient();
            anotherRedisClient.publish(channel, JSON.stringify(test));
        });
    });
    it("should inform the 'message' event when a subscribed channel receives a publish message", function (done) {
        var channel = prefix + 'test-channel';
        s.info('iw-redis.message', function (data) {
            expect(data.channel).to.be.equal(channel);
            expect(data.value.some).to.be.equal(test.some);
            done();
        });
        s.request('iw-redis.subscribe', channel, function (e, channelName) {
            expect(e).to.be.null;
            expect(channelName).to.be.equal(channel);
            var anotherRedisClient = redis.createClient();
            anotherRedisClient.publish(channel, JSON.stringify(test));
        });
    });
    it("should be able to publish to a channel", function (done) {
        var channel = prefix + 'test-channel';
        async.waterfall([
            function (cb) {
                s.request('iw-redis.subscribe', channel, function (e, channelName) {
                    expect(e).to.be.null;
                    expect(channelName).to.be.equal(channel);
                    cb(null);
                });
            },
            function (cb) {
                s.info('iw-redis.message-' + channel, function (data) {
                    expect(data.some).to.be.equal(test.some);
                    cb(null);
                }).request('iw-redis.publish', {
                    channel: channel,
                    value: test
                }, function (e, subscriberCount) {
                    expect(e).to.be.null;
                    expect(subscriberCount).to.be.equal(1);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            done();
        });
    });
    it("should not inform the 'message-[channel name]' event if unsubscribed", function (done) {
        var channel = prefix + 'test-channel';
        s.info('iw-redis.message-' + channel, function (data) {
            throw new Error('event should not have been called once unsubscribed');
        });
        async.waterfall([
            function (cb) {
                s.request('iw-redis.subscribe', channel, function (e, channelName) {
                    expect(e).to.be.null;
                    expect(channelName).to.be.equal(channel);
                    cb(null);
                });
            },
            function (cb) {
                s.request('iw-redis.unsubscribe', channel, function (e, channelName) {
                    expect(e).to.be.null;
                    expect(channelName).to.be.equal(channel);
                    cb(null);
                });
            }
        ], function (e) {
            expect(e).to.be.null;
            var anotherRedisClient = redis.createClient();
            anotherRedisClient.publish(channel, JSON.stringify(test), function () {
                setTimeout(done, 100);
            });
        });
    });
    afterEach(function (done) {
        s.dispose(function () {
            done();
        });
    });
});
//# sourceMappingURL=RedisWorker.test.js.map