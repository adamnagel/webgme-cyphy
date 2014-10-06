/**
 * Created by Yi Li on 8/12/2014.
 */
define(['plugin/FormulaEvaluator/FormulaEvaluator/dgraph', 'plugin/FormulaEvaluator/FormulaEvaluator/hashmap'], function(Dgraph, Hashmap) {
	function DFNode(object, token, func) {
		this.object = object;
		this.token = token;
		this.func = func;
		this.historySrcList = [];
		//--------------------------------
		this._currentToken = this.token;
	};

	DFNode.prototype.setToken = function(token) {
		this.token         = token;
		this._currentToken = token;
	}
	DFNode.prototype.resetToken = function() {
		this._currentToken = this.token
	};

	DFNode.prototype.activeNode = function() {
		assert(-1 !== this.token);
		assert(0 !== this._currentToken);
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
		this.G               = new Dgraph.DGraph();
		this.RG              = null;
		this.init_list       = [];
		this.idLUT           = new Hashmap.HashMap();
		this.dynamicNodeList = [];
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

	DataFlow.prototype.addDyNode = function(object, func) {
		var dfnode = new DFNode(object, -1, func);
		this.idLUT.set(object, dfnode);
		this.G.addVertex(dfnode);
		this.dynamicNodeList.push(dfnode);
		return this;
	}
	DataFlow.prototype.addEdge = function(object1, object2) {
		var df1 = this.idLUT.get(object1);
		var df2 = this.idLUT.get(object2);
		assert(df1);
		assert(df2);
		this.G.addEdge(df1, df2);
		return this;
	};

	DataFlow.prototype.localVisit = function(object) {
		var RG = this.RG;

		var dfnode = this.idLUT.get(object);
		//function: a -> b -> boolean 
		var warp = function(src, dst) {
			if (false === dst.activeNode()) {
				return false;
			}
			//if currentToken is reseted
			var dstList = []
			var tmp = RG.neighbor(dst);
			for(var i = 0; i < tmp.length; ++i)
				dstList.push(tmp[i].getObject());
			var result = dst.func(dstList, dst.getObject());
			return result;
		};
		this.G.localBFS(dfnode, warp)
	};

	DataFlow.prototype.findCycles = function() {
		return this.G.findCycles();
	}
	DataFlow.prototype.start = function() {
		if(null == this.RG)
			this.RG = this.G.reverse();

		for(var i = 0; i < this.dynamicNodeList.length; ++i)
			this.dynamicNodeList[i].setToken(this.RG.neighbor(this.dynamicNodeList[i]).length);

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
		if (null == condition) {
			console.log(condition.toString())
			throw "Assertion failed";
		}
	};
	return {
		DataFlow: DataFlow
	};
});