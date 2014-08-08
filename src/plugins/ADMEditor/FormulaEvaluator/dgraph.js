/**
 * Created by Yi Li on 6/25/2014.
 */
define([], function(){
    function VertexArray(){
        this.nodeSet = [];
        this.index = {};
        this.length = 0;
        this.add = function(node){
            this.index[node] = this.nodeSet.length;
            this.nodeSet.push(node);
            this.length += 1;
            return this;
        };
    };

    function AdjacencyList(n){
        this.scale = n;
        this.arr = function(scale){
            var result = new Array();
            for(var i = 0; i < scale; i += 1)
                result[i] = new Array();
            return result;
        }(n);


        this.print = function(){
            for(var i = 0; i < this.scale; i += 1){
                var str = []
                for(var j = 0; j < this.arr[i].length; j += 1){
                    str.push(this.arr[i][j]);
                }
                console.log(str);
            }
        };
        //add a path from i to j
        this.add = function(i,j){
            this.arr[i].push(j);
        };

        this.neighbor = function(i){
            return this.arr[i];
        };

        this.loacalBFS = function(i, afterReaching){
            var result = [];
            var stack = [];
            var reachableArray = [];
            for(var j = 0; j < this.scale; j += 1)
                reachableArray[j] = 0;

            reachableArray[i] = 1;
            stack.push(i);
            while(0 !== stack.length){
                var src = stack.pop();
                var nei = this.neighbor(src);
                for(var j = 0; j < nei.length; j += 1){
                    var dst = nei[j];
                    if(0 === reachableArray[dst]){
                        reachableArray[dst] = 1;
                        stack.push(dst);
                        afterReaching(src, dst);
                    }
                }
            }

            for(var j = 0; j < this.scale; j += 1){
                if(1 === reachableArray[j])
                    result.push(j);
            }
            return result;
        };
    };



    function DGraph(){
        this.vertexSet;
        this.edgeSet;
    };

    DGraph.prototype.addVertexSet = function(vertexSet){
        this.vertexSet = vertexSet;
        this.edgeSet = new AdjacencyList(vertexSet.length)
        return this;
    };

    DGraph.prototype.addEdge = function(node1, node2){
        var i = this.vertexSet.index[node1];
        var j = this.vertexSet.index[node2];
        this.edgeSet.add(i, j)
        return this;
    };

    DGraph.prototype.neighbor_index = function(node) {
        var i = this.vertexSet.index[node];
        return this.edgeSet.neighbor(i);
    };


    DGraph.prototype.localReachability_index = function(node) {
        var dummy = function(node1, node2){
            ;
        }
        return this.localBFS(node, dummy);
    };

    DGraph.prototype.localBFS = function(node, afterReaching) {
        var i = this.vertexSet.index[node];
        var vertexSet = this.vertexSet;
        return this.edgeSet.loacalBFS(i,
            function(srcIndex, dstIndex){
                src = vertexSet.nodeSet[srcIndex];
                dst = vertexSet.nodeSet[dstIndex];
                afterReaching(src, dst);
            });
    };


    function test() {
        var test = new DGraph();
        var vertexSet = new VertexArray();
        vertexSet.add('a') .add('b') .add('c') .add('d') .add('e') .add('f') .add('g');
        test.addVertexSet(vertexSet);
        test.addEdge('a', 'c').addEdge('a', 'd').addEdge('c', 'b').addEdge('e', 'f').addEdge('e', 'g');
        //test.addEdge('b', 'a'); //strong connected test
        test.edgeSet.print();
        var printEdge = function(src, dst){
            console.log("edge: " + src + " to " + dst);
        };
        test.localBFS('e', printEdge);
        assert(
                test.localReachability_index('a').toString() === [1,2,3].toString());
        assert(
                test.localReachability_index('e').toString() === [5,6].toString());
        assert(
                test.localReachability_index('c').toString() === [1].toString());
        console.log("all green");

    }

    function assert(condition) {
        if (!condition) {
            throw "Assertion failed";
        }
    };

    return{
        VertexArray: VertexArray,
        DGraph: DGraph
    };
})
