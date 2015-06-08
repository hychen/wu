/// <reference path="../bootstrap-test.d.ts" />
import mkdirp = require('mkdirp');
import rimraf = require('rimraf');
import RPC  = require('../../lib/rpc');
import PS  = require('../../lib/process');

function newActComp(){
    return {
        friendlyName: 'ActComp',
        fn: () => true
    }
};

function newSourceActComponent(){
    return {
        friendlyName: 'SourceActComp',
        exits: {
            success: {
                description: 'returns 1.'
            }
        },
        fn: (inputs, exits) => exits.success(1)
    }
}

function newDestActComponent(done?){
    return {
        friendlyName: 'DestActComp',
        inputs: {
            in: {
                description: 'an input value.'
            }
        },
        fn: (inputs) => {
            var res = inputs.in + 1;
            if(done){
                done(res);
            }else{
                return res;
            }
        }
    }
}

describe('RPC functions', () => {
    beforeEach((done) => {
        mkdirp(global['TEST_RUNTIME_ROOT_DIR'], (err) => {
            if(err) throw err;
            mkdirp(global['TEST_RUNTIME_SOCKET_DIR'], done);
        });
    });
    afterEach((done) => {
        rimraf(global['TEST_RUNTIME_ROOT_DIR'], () => {
            rimraf(global['TEST_RUNTIME_SOCKET_DIR'], done);
        });
    });
    describe('createRPCServer()', () => {
        it('creates a rpc server', (done) => {
            RPC.createRPCServer('A', newActComp(), {}, (server, process) => {
                expect(process.name).to.eq('A');
                process.stop();
                server.close();
                done();
            });
        });
        it('throws error if process name is duplicated.', (done) => {
            RPC.createRPCServer('A', newActComp(), {}, (server, process) => {
                var expect_defer = expect(() => {
                    RPC.createRPCServer('A', newActComp(), {}, () => done());
                });
                expect_defer.throw(/Duplicated process name/);
                done();
            });
        });
    });
});

describe('Process RPC Callbacks', () => {
    beforeEach((done) => {
        mkdirp(global['TEST_RUNTIME_ROOT_DIR'], (err) => {
            if(err) throw err;
            mkdirp(global['TEST_RUNTIME_SOCKET_DIR'], done);
        });
    });
    afterEach((done) => {
        rimraf(global['TEST_RUNTIME_ROOT_DIR'], () => {
            rimraf(global['TEST_RUNTIME_SOCKET_DIR'], done);
        });
    });
    describe('rpcCallbackPingMethod()', () => {
        it('response `pong`.', (done) => {
            var process = new PS.Process('A', newActComp());
            var cb = RPC.rpcProcessPingMethod.bind(process);
            cb(null, (err, res, more) => {
                expect(res).to.eq('pong');
                done();
            });
        });
    });
    describe('rpcProcessConfigureMethod()', () => {
        it('changes process behavior.', (done) => {
            var process = new PS.Process('A', newActComp());
            var cb = RPC.rpcProcessConfigureMethod.bind(process);
            cb({}, null, (err, res, more) => {
                done();
            });
        });
    });
    describe('rpcProcessConnectMethod()', () => {
        it('connect a source port to another port.', (done) => {
            var process_b = new PS.Process('B', newSourceActComponent());
            var process_a = new PS.Process('A', newDestActComponent());
            RPC.controlRPCServer = (...args: any[]) => {
                return process_b.ports['success'].addr;
            };
            var cb = RPC.rpcProcessConnectMethod.bind(process_a);
            cb('in', 'B', 'success', null, (err, res, more) => {
                done()
            });
        });
    });
});