require! mkdirp
require! rimraf

{Process, WorkerProcess, control-process} = ic.process!

mock-component = (name, inports, outports, fn) ->
  tr = ->
    o = {}
    for p in it
      o[p] = do
        description: "port description."
    return o
  do
    friendlyName: name
    inports: tr inports
    outports: tr outports
    fn: fn

# We might have more than 10 processes in testing, but will only 
# one Process instance per each ndoe.js process.
process.setMaxListeners 100

describe 'Process', ->
  beforeEach (done) ->
    mkdirp "#{TEST_RUNTIME_DIR}/socket", done
  afterEach (done) ->
    rimraf "#{TEST_RUNTIME_DIR}", done
  describe 'should be able controlled via RPC.', -> ``it``
    .. '#status()', (done) ->
      hello = new Process 'hello'
      hello.start!
      err, res, more <- control-process 'hello', 'status'
      expect err .to.eq undefined
      res.should.be.eq 'ready'
      hello.stop!
      done!
    .. '#run()', (done) ->
      p = new Process 'ready-process'
      p.start!
      err, res, more <- control-process 'ready-process', 'run'
      err, res, more <- control-process 'ready-process', 'status'
      expect err .to.not.be.ok
      res.should.be.eq 'running'
      p.stop!
      done!
    .. '#pause()', (done) ->
      p = new Process 'running-process'
      p.start!
      err, res, more <- control-process 'running-process', 'run'
      err, res, more <- control-process 'running-process', 'pause'
      err, res, more <- control-process 'running-process', 'status'
      expect err .to.eq undefined
      res.should.be.eq 'suspend'
      p.stop!
      done!

describe 'WorkerProcess', ->
  beforeEach (done) ->
    mkdirp "#{TEST_RUNTIME_DIR}/socket", done
  afterEach (done) ->
    rimraf "#{TEST_RUNTIME_DIR}", done
  describe 'is a instance of a component.', -> ``it``
    .. 'should have 0-infinit ports.', (done) ->
      p = new WorkerProcess 'Fake', mock-component 'Fake', <[in]>, <[out]>, ->
      p.ports.should.deep.eq {}
      p.start!
      p.ports.in.name.should.eq 'in'
      p.ports.out.name.should.eq 'out'
      p.ports.out.addr.should.ok
      p.stop!
      done!
  describe 'can be controlled by RPC.', -> ``it``
    .. '#info()', (done) ->
      fn = (inputs, exits) -> 
        exits.success {out:inputs.in + 1}
      comp = mock-component 'Fake', <[in]>, <[out]>, fn
      p = new WorkerProcess 'Fake', comp
      p.start!
      err, res, more <- control-process 'Fake', 'info', 'outport-addr', 'out'
      res.should.be.ok
      p.stop!
      done!
    .. '#connect()', (done) ->
      fn = (inputs, exits) -> 
        exits.success {out:inputs.in + 1}
      comp = mock-component 'Fake', <[in]>, <[out]>, fn
      p1 = new WorkerProcess 'Fake1', comp
      p2 = new WorkerProcess 'Fake2', comp
      p1.start!
      p2.start!
      err, res, more <- control-process 'Fake2', 'connect', 'in', 'Fake1', 'out'
      res.should.be.ok
      p1.stop!
      p2.stop!
      done!
    .. '#connect() auto firing', (done) ->
      fn1 = (inputs, exits) ->
        exits.success {out: 10}
      fn2 = (inputs, exits) -> 
        exits.success {out: inputs.in + 1}
      fn3 = (inputs, exits) -> 
        inputs.should.be.deep.eq {in:11}
      comp1 = mock-component 'Fake1', [], <[out]>, fn1
      comp2 = mock-component 'Fake2', <[in]>, <[out]>, fn2
      comp3 = mock-component 'Fake2', <[in]>, [], fn3
      p1 = new WorkerProcess 'Fake1', comp1
      p2 = new WorkerProcess 'Fake2', comp2
      p3 = new WorkerProcess 'Fake3', comp3
      p1.start!
      p2.start!
      p3.start!
      err, res, more <- control-process 'Fake2', 'connect', 'in', 'Fake1', 'out'
      err, res, more <- control-process 'Fake3', 'connect', 'in', 'Fake2', 'out'
      err, res, more <- control-process 'Fake2', 'run'
      err, res, more <- control-process 'Fake3', 'run'
      err, res, more <- control-process 'Fake1', 'run'
      p1.stop!
      p2.stop!
      p3.stop!      
      done!      
    .. '#fire()', (done) ->
      fn = (inputs, exits) -> 
        exits.success {out:inputs.in + 1}
      comp = mock-component 'Fake', <[in]>, <[out]>, fn
      p = new WorkerProcess 'Fake', comp
      p.ports.should.deep.eq {}
      p.start!
      err, res, more <- control-process 'Fake', 'run'
      err, res, more <- control-process 'Fake', 'fire', {in:1}
      res.should.be.deep.eq {out:2}
      err, res, more <- control-process 'Fake', 'pause'
      err, res, more <- control-process 'Fake', 'fire', {in:1}
      err.message.should.be.eq 'process is suspend.'
      p.stop!
      done!
