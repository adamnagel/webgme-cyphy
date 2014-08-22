/**
 * Created by Yi Li on 8/12/2014.
 */
define(['plugin/FormulaEvaluator/FormulaEvaluator/dgraph', 'plugin/FormulaEvaluator/FormulaEvaluator/hashmap'], function(Dgraph, Hashmap) {
	function DFNode(object, token, func) {
		this.object         = object;
		this.token          = token;
		this.func           = func;
		this.historySrcList = [];
		//--------------------------------
		this._currentToken  = this.token;
	};

	DFNode.prototype.resetToken = function() {
		this._currentToken = this.token
	};

	DFNode.prototype.activeNode = function() {
		assert(0 !== this._currentToken)
		this._currentToken -= 1
		if (0 === this._currentToken) {
			this.resetToken();
			return true;
		} else {

			return false;
		}
	};

	DFNode.prototype.getObject = function() {
		return this.object;
	};

	DFNode.prototype.addHistorySrc = function(object) {
		this.historySrcList.push(object);
	};

	DFNode.prototype.resetHistory = function() {
		this.historySrcList.length = 0;
	};

	DFNode.prototype.getHistory = function() {
		return this.historySrcList;
	};

	function DataFlow() {
		this.G         = new Dgraph.DGraph();
		this.init_list = [];
		this.idLUT     = new Hashmap.HashMap(); 
	};

	DataFlow.prototype.setInitList = function(list) {
		this.init_list = list;
	};

	DataFlow.prototype.addNode = function(object, token, func) {
		var dfnode = new DFNode(object, token, func);
		this.idLUT.set(object, dfnode);
		this.G.addVertex(dfnode);
		return this;
	};

	DataFlow.prototype.addEdge = function(object1, object2) {
		var df1 = this.idLUT.get(object1);
		var df2 = this.idLUT.get(object2);
		assert(null != df1);
		assert(null != df2);
		this.G.addEdge(df1, df2);
		return this;
	};

	DataFlow.prototype.localVisit = function(object) {
		var dfnode = this.idLUT.get(object);
		//function: a -> b -> boolean 
		var warp = function(src, dst) {
			if(false === dst.activeNode()){
				dst.addHistorySrc(src.getObject());
				return false;
			}
			dst.addHistorySrc(src.getObject());
			//if currentToken is reseted
			var result = dst.func(dst.getHistory(), dst.getObject());
			dst.resetHistory();
			return result;
		};
		this.G.localBFS(dfnode, warp)
	};

	DataFlow.prototype.start = function() {
		for (var i = this.init_list.length - 1; i >= 0; i--) {
			this.localVisit(this.init_list[i]);
		};
	};

	DataFlow.prototype.reset = function(node) {
		var reset = function(src, dst) {
			src.resetToken();
			dst.resetToken();
		};
		this.G.localBFS(node, reset);
	};

	DataFlow.prototype.resetAll = function() {
		for (var i = this.init_list.length - 1; i >= 0; i--) {
			this.reset(this.init_list[i]);	
		};
	};

	function assert(condition) {
		if (!condition) {
			throw "Assertion failed";
		}
	};
	return {
		DataFlow: DataFlow
	};
});