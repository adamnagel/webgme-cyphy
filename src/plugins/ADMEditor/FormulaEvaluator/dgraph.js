/**
 * Created by Yi Li on 6/25/2014.
 */
define(['plugin/FormulaEvaluator/FormulaEvaluator/hashmap'], function(Hashmap) {
    function VertexArray() {
        this.nodeSet = [];
        this.index = new Hashmap.HashMap();
        this.length = 0;
    };

    VertexArray.prototype.add = function(v) {
        this.index.set(v, this.nodeSet.length);
        this.nodeSet.push(v);
        this.length += 1;
        return this;
    };

    VertexArray.prototype.vertexToIndex = function(v) {
        return this.index.get(v);
    };

    VertexArray.prototype.scale = function(){
        return this.nodeSet.length;
    };

    VertexArray.prototype.indexToVertex = function(i) {
        return this.nodeSet[i];
    };

    function AdjacencyList() {
        this.arr = new Hashmap.HashMap();
    };

    AdjacencyList.prototype.print = function() {
        var keys = this.arr.keys();
        for (var i = 0; i < keys.length; ++i) {
            var tmp = this.arr.get(keys[i]);
            for (var j = 0; j < tmp.length; ++j) {
                console.log('(' + keys[i] + ',' + tmp[j] + ')');
            }
        }
    };

    //add a path from v1 to v2
    AdjacencyList.prototype.add = function(v1, v2) {
        if(false == this.arr.has(v1)){
            var t = new Array();
            this.arr.set(v1, t);
        }
        var list = this.arr.get(v1);
        list.push(v2);
    };

    AdjacencyList.prototype.neighbor = function(v) {
        if(false == this.arr.has(v))
            return [];
        return this.arr.get(v);
    };

    function DGraph() {
        this.vertexSet = new VertexArray();
        this.edgeSet   = new AdjacencyList();
    };

    DGraph.prototype.addVertex = function(v) {
        this.vertexSet.add(v);
        return this;
    };

    DGraph.prototype.addEdge = function(v1, v2) {
        this.edgeSet.add(v1, v2)
        return this;
    };

    DGraph.prototype.neighbor = function(v) {
        return this.edgeSet.neighbor(v);
    };

    DGraph.prototype.localReachability_index = function(node) {
        var dummy = function(node1, node2) {
        };
        return this.localBFS(node, dummy);
    };

    DGraph.prototype.localBFS = function(v, afterReaching) {
        var queue          = [];
        var reachableArray = [];
        for(var i = 0; i < this.vertexSet.scale(); i += 1)
            reachableArray[i] = 0;
        //--------------------------------------------------
        queue.push(v);
        while (0 !== queue.length) {
            var src = queue.shift();
            var nei = this.neighbor(src);
            for (var i = 0; i < nei.length; i += 1) {
                var dst = nei[i];
                if (1 === reachableArray[this.vertexSet.vertexToIndex(dst)])
                    continue;
                if (false === afterReaching(src, dst))
                    continue;
                queue.push(dst);
                reachableArray[this.vertexSet.vertexToIndex(dst)] = 1;
            }
        }
    };

    
    DGraph.prototype.findCycles = function(){
        var stack = [];
        var reachableArray = [];
        var tmp = new Hashmap.HashMap();
        var ret = [];
        for(var i = 0; i < this.vertexSet.scale(); i += 1)
            reachableArray[i] = 0;
        //-------------------------------------------------------------
        stack.push(this.vertexSet.nodeSet[0]);
        while (0 !== stack.length) {
            var src = stack.pop();
            if( 1 === reachableArray[this.vertexSet.vertexToIndex(src)]){
                var cycle = [];
                cycle.push(src)
                var ancestor = tmp.get(src);
                while(ancestor !== src && ancestor != null){
                    cycle.push(ancestor);
                    ancestor = tmp.get(ancestor);
                }
                ret.push(cycle);
                continue;
            }
            // if not
            reachableArray[this.vertexSet.vertexToIndex(src)] = 1;
            var nei = this.neighbor(src);
            for(var i = 0; i < nei.length; i += 1){
                tmp.set(nei[i], src);
                stack.push(nei[i]);
            }

        }
        return ret;
    }
    DGraph.prototype.reverse = function() {
    	var ret = new DGraph();
    	for(var i = 0; i < this.vertexSet.nodeSet.length; ++i)
    		ret.addVertex(this.vertexSet.nodeSet[i]);
    	var keys = this.edgeSet.arr.keys();
    	for(var i = 0; i < keys.length; ++i){
    		var tmp = this.edgeSet.arr.get(keys[i]);
    		for(var j = 0; j < tmp.length; ++j){
    			ret.addEdge(tmp[j], keys[i]);
    		}
    	}
    	return ret;
    }

    function test() {
        var test = new DGraph();
        test.addVertex('a').addVertex('b').addVertex('c').addVertex('d').addVertex('e').addVertex('f').addVertex('g');
        test.addEdge('a', 'c').addEdge('a', 'd').addEdge('c', 'b').addEdge('e', 'f').addEdge('e', 'g');
        //test.addEdge('b', 'a'); //strong connected test
        test.edgeSet.print();
        var printEdge = function(src, dst) {
            console.log("edge: " + src + " to " + dst);
        };
        test.localBFS('e', printEdge);
        assert(
            test.localReachability_index('a').toString() === [1, 2, 3].toString());
        assert(
            test.localReachability_index('e').toString() === [5, 6].toString());
        assert(
            test.localReachability_index('c').toString() === [1].toString());
        console.log("all green");

    }

    function assert(condition) {
        if (!condition) {
            throw "Assertion failed";
        }
    };

    return {
        DGraph: DGraph
    };
});