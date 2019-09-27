var cp = require('child_process')
var duplexer = require('duplexer')
var stream = require('stream')
var hashToArray = require('hash-to-array')

module.exports = function soxStream(opts) {
	if (!opts || !opts.output || (!opts.output.t && !opts.output.type)) {
		throw new Error('Options must include output.type')
	}
	var soxOutput = new stream.PassThrough()
	var args = []
		.concat(hashToArray(opts.global || []))
		.concat(hashToArray(opts.input || []))
		.concat('-')
		.concat(hashToArray(opts.input2 || []))
		.concat(opts.filename2 || [])
		.concat(hashToArray(opts.output || []))
		.concat('-')
		.concat(opts.effects || [])
		.reduce(function (flattened, ele) {
			return flattened.concat(ele)
		}, [])
	var sox = cp.spawn(opts.soxPath || 'sox', args)
	sox.stdout.pipe(soxOutput)
	sox.stdout.on('close', function () {
		duplex.emit('finish', null)
	})
	sox.stderr.on('data', function (chunk) {
		duplex.emit(new Error, chunk)
	})
	sox.on('error', function(err){
		duplex.emit('error', err)
	})
	var duplex = duplexer(sox.stdin, soxOutput)
	return duplex
}
