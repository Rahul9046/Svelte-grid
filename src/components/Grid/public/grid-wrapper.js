
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function noop() { }
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, props) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (key, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
            return ret;
        })
        : prop_values;
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, detail));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
}

/* src/grid.svelte generated by Svelte v3.15.0 */

const file = "src/grid.svelte";

function create_fragment(ctx) {
	let h1;
	let t;

	const block = {
		c: function create() {
			h1 = element("h1");
			t = text(ctx.dataSource);
			add_location(h1, file, 3, 0, 42);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			append_dev(h1, t);
		},
		p: function update(changed, ctx) {
			if (changed.dataSource) set_data_dev(t, ctx.dataSource);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(h1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { dataSource } = $$props;
	const writable_props = ["dataSource"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("dataSource" in $$props) $$invalidate("dataSource", dataSource = $$props.dataSource);
	};

	$$self.$capture_state = () => {
		return { dataSource };
	};

	$$self.$inject_state = $$props => {
		if ("dataSource" in $$props) $$invalidate("dataSource", dataSource = $$props.dataSource);
	};

	return { dataSource };
}

class Grid extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { dataSource: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Grid",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.dataSource === undefined && !("dataSource" in props)) {
			console.warn("<Grid> was created without expected prop 'dataSource'");
		}
	}

	get dataSource() {
		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set dataSource(value) {
		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var grid = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': Grid
});

var isNumber=function isNumber(x){return typeof x==="number"&&!isNaN(x-x)};

var numberComparator=function numberComparator(a,b){if(a===null||typeof a==="undefined"){return b===a?0:1}else if(isNumber(b)){return a-b}else if(isNaN(a)&&isNaN(b)){return 0}return -1},stringComparator=function stringComparator(a,b){if(a===null||typeof a==="undefined"){return b===a?0:1}else if(isNumber(b)){return isNumber(a)?a-b:-1}return a===b?0:a<b?-1:1};

function binaryInsertionSort(arr,_comparer,_lo,_hi,_start){var lo=_lo||0,hi=_hi||arr.length,start=_start||lo+1,comparer=_comparer;if(!comparer){comparer=function comparer(a,b){return a-b};}if(lo===start){++start;}for(;start<hi;++start){var l=lo,r=start,pivot=arr[r];do{var p=l+(r-l>>1);if(comparer(pivot,arr[p])<0){r=p;}else{l=p+1;}}while(l<r);for(var _p=start;_p>l;--_p){arr[_p]=arr[_p-1];}arr[l]=pivot;}}var MINRUN_LENGTH=64,MIN_GALLOP_LENGTH=7,DEFAULT_TMP_STORAGE_LEN=256,MAX_STACK_SIZE=40;function reverseSlice(arr,_lo,_hi){var hi=_hi,lo=_lo;--hi;while(lo<hi){var temp=arr[lo];arr[lo++]=arr[hi];arr[hi--]=temp;}}function countRun(arr,comparer,lo,hi){var endIndex=lo+1;if(endIndex===hi){return 1}if(comparer(arr[endIndex++],arr[lo])<0){while(endIndex<hi&&comparer(arr[endIndex],arr[endIndex-1])<0){endIndex++;}reverseSlice(arr,lo,endIndex);}else{while(endIndex<hi&&comparer(arr[endIndex],arr[endIndex-1])>=0){endIndex++;}}return endIndex-lo}function mergeComputeMinrun(_n){var r=0,n=_n;while(n>=MINRUN_LENGTH){r|=n&1;n>>=1;}return n+r}function gallopLeft(key,arr,start,length,hint,comparer){var lastOffset=0,maxOffset=0,offset=1,tmp,m;if(comparer(key,arr[start+hint])>0){maxOffset=length-hint;while(offset<maxOffset&&comparer(key,arr[start+hint+offset])>0){lastOffset=offset;offset=(offset<<1)+1;if(offset<=0){offset=maxOffset;}}if(offset>maxOffset){offset=maxOffset;}lastOffset+=hint;offset+=hint;}else{maxOffset=hint+1;while(offset<maxOffset&&comparer(key,arr[start+hint-offset])<=0){lastOffset=offset;offset=(offset<<1)+1;if(offset<=0){offset=maxOffset;}}if(offset>maxOffset){offset=maxOffset;}tmp=lastOffset;lastOffset=hint-offset;offset=hint-tmp;}lastOffset++;while(lastOffset<offset){m=lastOffset+(offset-lastOffset>>>1);if(comparer(key,arr[start+m])>0){lastOffset=m+1;}else{offset=m;}}return offset}function gallopRight(value,arr,start,length,hint,comparer){var lastOffset=0,maxOffset=0,offset=1,tmp,m;if(comparer(value,arr[start+hint])<0){maxOffset=hint+1;while(offset<maxOffset&&comparer(value,arr[start+hint-offset])<0){lastOffset=offset;offset=(offset<<1)+1;if(offset<=0){offset=maxOffset;}}if(offset>maxOffset){offset=maxOffset;}tmp=lastOffset;lastOffset=hint-offset;offset=hint-tmp;}else{maxOffset=length-hint;while(offset<maxOffset&&comparer(value,arr[start+hint+offset])>=0){lastOffset=offset;offset=(offset<<1)+1;if(offset<=0){offset=maxOffset;}}if(offset>maxOffset){offset=maxOffset;}lastOffset+=hint;offset+=hint;}lastOffset++;while(lastOffset<offset){m=lastOffset+(offset-lastOffset>>>1);if(comparer(value,arr[start+m])<0){offset=m;}else{lastOffset=m+1;}}return offset}var MergeState=function(){function MergeState(arr,comparer){this.arr=arr;this.comparer=comparer;this.length=arr.length;this.tmpStorageLen=this.length<2*DEFAULT_TMP_STORAGE_LEN?this.length>>>1:DEFAULT_TMP_STORAGE_LEN;this.tmp=new Array(this.tmpStorageLen);this.runBaseArr=new Array(MAX_STACK_SIZE);this.runLenArr=new Array(MAX_STACK_SIZE);this.minGallop=MIN_GALLOP_LENGTH;this.stackSize=0;}var _proto=MergeState.prototype;_proto.pushRun=function pushRun(runStart,runLength){this.runBaseArr[this.stackSize]=runStart;this.runLenArr[this.stackSize]=runLength;this.stackSize++;};_proto.mergeCollapse=function mergeCollapse(){var n;while(this.stackSize>1){n=this.stackSize-2;if(n>=1&&this.runLenArr[n-1]<=this.runLenArr[n]+this.runLenArr[n+1]||n>=2&&this.runLenArr[n-2]<=this.runLenArr[n]+this.runLenArr[n-1]){if(this.runLenArr[n-1]<this.runLenArr[n+1]){n--;}}else if(this.runLenArr[n]>this.runLenArr[n+1]){break}this.mergeAt(n);}};_proto.mergeForceCollapse=function mergeForceCollapse(){var n;while(this.stackSize>1){n=this.stackSize-2;if(n>0&&this.runLenArr[n-1]<this.runLenArr[n+1]){n--;}this.mergeAt(n);}};_proto.mergeAt=function mergeAt(i){var comparer=this.comparer,arr=this.arr,start1=this.runBaseArr[i],length1=this.runLenArr[i],start2=this.runBaseArr[i+1],length2=this.runLenArr[i+1],k;this.runLenArr[i]=length1+length2;if(i===this.stackSize-3){this.runBaseArr[i+1]=this.runBaseArr[i+2];this.runLenArr[i+1]=this.runLenArr[i+2];}this.stackSize--;k=gallopRight(arr[start2],arr,start1,length1,0,comparer);start1+=k;length1-=k;if(length1===0){return}length2=gallopLeft(arr[start1+length1-1],arr,start2,length2,length2-1,comparer);if(length2===0){return}if(length1<=length2){this.mergeLo(start1,length1,start2,length2);}else{this.mergeHi(start1,length1,start2,length2);}};_proto.mergeLo=function mergeLo(start1,_length1,start2,_length2){var i=0,cursor1=0,cursor2=start2,dest=start1,minGallop,count1,count2,exit,length1=_length1,length2=_length2;for(i=0;i<length1;i++){this.tmp[i]=this.arr[start1+i];}this.arr[dest++]=this.arr[cursor2++];if(--length2===0){for(i=0;i<length1;i++){this.arr[dest+i]=this.tmp[cursor1+i];}return}if(length1===1){for(i=0;i<length2;i++){this.arr[dest+i]=this.arr[cursor2+i];}this.arr[dest+length2]=this.tmp[cursor1];return}minGallop=this.minGallop;while(true){count1=0;count2=0;exit=false;do{if(this.comparer(this.arr[cursor2],this.tmp[cursor1])<0){this.arr[dest++]=this.arr[cursor2++];count2++;count1=0;if(--length2===0){exit=true;break}}else{this.arr[dest++]=this.tmp[cursor1++];count1++;count2=0;if(--length1===1){exit=true;break}}}while((count1|count2)<minGallop);if(exit){break}do{count1=gallopRight(this.arr[cursor2],this.tmp,cursor1,length1,0,this.comparer);if(count1!==0){for(i=0;i<count1;i++){this.arr[dest+i]=this.tmp[cursor1+i];}dest+=count1;cursor1+=count1;length1-=count1;if(length1<=1){exit=true;break}}this.arr[dest++]=this.arr[cursor2++];if(--length2===0){exit=true;break}count2=gallopLeft(this.tmp[cursor1],this.arr,cursor2,length2,0,this.comparer);if(count2!==0){for(i=0;i<count2;i++){this.arr[dest+i]=this.arr[cursor2+i];}dest+=count2;cursor2+=count2;length2-=count2;if(length2===0){exit=true;break}}this.arr[dest++]=this.tmp[cursor1++];if(--length1===1){exit=true;break}minGallop--;}while(count1>=MIN_GALLOP_LENGTH||count2>=MIN_GALLOP_LENGTH);if(exit){break}if(minGallop<0){minGallop=0;}minGallop+=2;}this.minGallop=minGallop;if(minGallop<1){this.minGallop=1;}if(length1===1){for(i=0;i<length2;i++){this.arr[dest+i]=this.arr[cursor2+i];}this.arr[dest+length2]=this.tmp[cursor1];}else{for(i=0;i<length1;i++){this.arr[dest+i]=this.tmp[cursor1+i];}}};_proto.mergeHi=function mergeHi(start1,_length1,start2,_length2){var i=0,length1=_length1,length2=_length2,cursor1=start1+length1-1,cursor2=length2-1,dest=start2+length2-1,customCursor=0,customDest=0,minGallop,count1,count2,exit;for(i=0;i<length2;i++){this.tmp[i]=this.arr[start2+i];}this.arr[dest--]=this.arr[cursor1--];if(--length1===0){customCursor=dest-(length2-1);for(i=0;i<length2;i++){this.arr[customCursor+i]=this.tmp[i];}return}if(length2===1){dest-=length1;cursor1-=length1;customDest=dest+1;customCursor=cursor1+1;for(i=length1-1;i>=0;i--){this.arr[customDest+i]=this.arr[customCursor+i];}this.arr[dest]=this.tmp[cursor2];return}minGallop=this.minGallop;while(true){count1=0;count2=0;exit=false;do{if(this.comparer(this.tmp[cursor2],this.arr[cursor1])<0){this.arr[dest--]=this.arr[cursor1--];count1++;count2=0;if(--length1===0){exit=true;break}}else{this.arr[dest--]=this.tmp[cursor2--];count2++;count1=0;if(--length2===1){exit=true;break}}}while((count1|count2)<minGallop);if(exit){break}do{count1=length1-gallopRight(this.tmp[cursor2],this.arr,start1,length1,length1-1,this.comparer);if(count1!==0){dest-=count1;cursor1-=count1;length1-=count1;customDest=dest+1;customCursor=cursor1+1;for(i=count1-1;i>=0;i--){this.arr[customDest+i]=this.arr[customCursor+i];}if(length1===0){exit=true;break}}this.arr[dest--]=this.tmp[cursor2--];if(--length2===1){exit=true;break}count2=length2-gallopLeft(this.arr[cursor1],this.tmp,0,length2,length2-1,this.comparer);if(count2!==0){dest-=count2;cursor2-=count2;length2-=count2;customDest=dest+1;customCursor=cursor2+1;for(i=0;i<count2;i++){this.arr[customDest+i]=this.tmp[customCursor+i];}if(length2<=1){exit=true;break}}this.arr[dest--]=this.arr[cursor1--];if(--length1===0){exit=true;break}minGallop--;}while(count1>=MIN_GALLOP_LENGTH||count2>=MIN_GALLOP_LENGTH);if(exit){break}if(minGallop<0){minGallop=0;}minGallop+=2;}this.minGallop=minGallop;if(minGallop<1){this.minGallop=1;}if(length2===1){dest-=length1;cursor1-=length1;customDest=dest+1;customCursor=cursor1+1;for(i=length1-1;i>=0;i--){this.arr[customDest+i]=this.arr[customCursor+i];}this.arr[dest]=this.tmp[cursor2];}else{customCursor=dest-(length2-1);for(i=0;i<length2;i++){this.arr[customCursor+i]=this.tmp[i];}}};return MergeState}();function timSort(arr,_comparer,_lo,_hi){var lo=_lo,hi=_hi,comparer=_comparer,nremaining,n,minrun,mergeState,force;if(arr.constructor!==Array){throw new TypeError("Sorting can only be applied on arrays.")}lo=lo||0;hi=hi||arr.length;if(!comparer){comparer=function comparer(a,b){return a-b};}nremaining=hi-lo;if(nremaining<2){return}if(nremaining<MINRUN_LENGTH){n=countRun(arr,comparer,lo,hi);binaryInsertionSort(arr,comparer,lo,hi,lo+n);return}minrun=mergeComputeMinrun(nremaining);mergeState=new MergeState(arr,comparer);do{n=countRun(arr,comparer,lo,lo+nremaining);if(n<minrun){force=nremaining<=minrun?nremaining:minrun;binaryInsertionSort(arr,comparer,lo,lo+force,lo+n);n=force;}mergeState.pushRun(lo,n);mergeState.mergeCollapse();nremaining-=n;lo+=n;}while(nremaining!==0);mergeState.mergeForceCollapse();}

var globalConfig={enableUTC:false};function getConfig(configName){if(!configName)throw new Error("configName is missing");return globalConfig[configName]}

var pads = {"-":"",_:" ",0:"0"};

var PERCENT_CHAR_CODE=37,isNil=function isNil(x){return x===null||typeof x==="undefined"};var TimeFormatter=function(){function TimeFormatter(specifier,formats){this._specifier=specifier;this._formats=formats;}var _proto=TimeFormatter.prototype;_proto.format=function format(_date){var string=[],date=_date,i=-1,j=0,specifier=this._specifier,n=specifier.length,c,pad,format;if(!(date instanceof Date))date=new Date(+date);while(++i<n){if(specifier.charCodeAt(i)===PERCENT_CHAR_CODE){string.push(specifier.slice(j,i));c=specifier.charAt(++i);pad=pads[c];if(isNil(pad)){pad=c==="e"?" ":"0";}else{c=specifier.charAt(++i);}format=this._formats[c];if(format){c=format(date,pad);}string.push(c);j=i+1;}}string.push(specifier.slice(j,i));return string.join("")};_proto.toString=function toString(){return this._specifier};return TimeFormatter}();

var t0=new Date,t1=new Date;var isNil$1=function isNil(d){return typeof d==="undefined"||d===null};var TimeInterval=function(){function TimeInterval(name,floori,offseti,count,field){this._name=name;this._floori=floori;this._offseti=offseti;this._count=count;this._field=field;}var _proto=TimeInterval.prototype;_proto.name=function name(){return this._name};_proto.floor=function floor(date){var newDate=new Date(Number(date));this._floori(newDate);return newDate};_proto.ceil=function ceil(date){var datei=new Date(date-1);this._floori(datei);this._offseti(datei,1);this._floori(datei);return datei};_proto.round=function round(date){var d0=this.floor(date),d1=this.ceil(date);return date-d0<d1-date?d0:d1};_proto.offset=function offset(date,step){var datei=new Date(Number(date));this._offseti(datei,isNil$1(step)?1:Math.floor(step));return datei};_proto.range=function range(start,stop,step){var range=[],starti=this.ceil(start),stepi=isNil$1(step)?1:Math.floor(step);var previous;if(!(starti<stop)||!(stepi>0))return range;do{previous=new Date(Number(starti));range.push(previous);this._offseti(starti,stepi);this._floori(starti);}while(previous<starti&&starti<stop);return range};_proto.filter=function filter(test){var _this=this;return new TimeInterval(this.name(),(function(date){if(!Number.isNaN(Number(date))){while(_this._floori(date),!test(date)){date.setTime(date-1);}}}),(function(date,step){var stepi=step;if(!Number.isNaN(Number(date))){if(stepi<0){while(++stepi<=0){do{_this._offseti(date,-1);}while(!test(date))}}else{while(--stepi>=0){do{_this._offseti(date,1);}while(!test(date))}}}}))};_proto.count=function count(start,end){var count=0;if(this._count){t0.setTime(Number(start));t1.setTime(Number(end));this._floori(t0);this._floori(t1);count=Math.floor(this._count(t0,t1));}return count};_proto.every=function every(step){var _this2=this;var stepi=Math.floor(step);var everyInterval=null;if(!this._count||!Number.isFinite(stepi)||!(stepi>0)){everyInterval=null;}else if(!(stepi>1)){everyInterval=this;}else{everyInterval=this.filter(this._field?function(d){return _this2._field(d)%stepi===0}:function(d){return _this2.count(0,d)%stepi===0});}return everyInterval};return TimeInterval}();

var durationMinute=6e4,durationDay=864e5,durationWeek=6048e5;

var day=new TimeInterval("day",(function(d){return d.setHours(0,0,0,0)}),(function(d,s){return d.setDate(d.getDate()+s)}),(function(s,e){return (e-s-(e.getTimezoneOffset()-s.getTimezoneOffset())*durationMinute)/durationDay}),(function(d){return d.getDate()-1}));

var utcDay=new TimeInterval("day",(function(d){return d.setUTCHours(0,0,0,0)}),(function(d,s){return d.setUTCDate(d.getUTCDate()+s)}),(function(s,e){return (e-s)/durationDay}),(function(d){return d.getUTCDate()-1}));

var utcWeekday=function utcWeekday(i,n){return new TimeInterval(n,(function(d){d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+7-i)%7);d.setUTCHours(0,0,0,0);}),(function(d,s){return d.setUTCDate(d.getUTCDate()+s*7)}),(function(s,e){return (e-s)/durationWeek}))},utcSunday=utcWeekday(0,"sunday"),utcMonday=utcWeekday(1,"monday"),utcThursday=utcWeekday(4,"thursday");

var weekday=function weekday(i,n){return new TimeInterval(n,(function(d){d.setDate(d.getDate()-(d.getDay()+7-i)%7);d.setHours(0,0,0,0);}),(function(d,s){return d.setDate(d.getDate()+s*7)}),(function(s,e){return (e-s-(e.getTimezoneOffset()-s.getTimezoneOffset())*durationMinute)/durationWeek}))},sunday=weekday(0,"sunday"),monday=weekday(1,"monday"),thursday=weekday(4,"thursday");

var PERCENT_CHAR_CODE$1=37,BLANK="",newYear=function newYear(y){return {y:y,m:0,d:1,H:0,M:0,S:0,L:0}},utcDate=function utcDate(d){if(d.y>=0&&d.y<100){var date=new Date(Date.UTC(-1,d.m,d.d,d.H,d.M,d.S,d.L));date.setUTCFullYear(d.y);return date}return new Date(Date.UTC(d.y,d.m,d.d,d.H,d.M,d.S,d.L))};var TimeParser=function(){function TimeParser(specifier,parses,newDate){this._specifier=specifier;this._parses=parses;this._newDate=newDate;}var _proto=TimeParser.prototype;_proto.parseSpecifier=function parseSpecifier(d,string,_j){var i=0,n=this._specifier.length,m=string.length,c,j=_j,parse;while(i<n){if(j>=m)return -1;c=this._specifier.charCodeAt(i++);if(c===PERCENT_CHAR_CODE$1){c=this._specifier.charAt(i++);parse=this._parses[c in pads?this._specifier.charAt(i++):c];if(!parse||(j=parse(d,string,j))<0){return -1}}else if(c!==string.charCodeAt(j++)){return -1}}return j};_proto.parse=function parse(_string){var d=newYear(1900),i,week,day$1,string=_string;string+=BLANK;i=this.parseSpecifier(d,string,0);if(i!==string.length)return null;if("Q"in d)return new Date(d.Q);if("p"in d)d.H=d.H%12+d.p*12;if("V"in d){if(d.V<1||d.V>53)return null;if(!("w"in d))d.w=1;if("Z"in d){week=utcDate(newYear(d.y));day$1=week.getUTCDay();week=day$1>4||day$1===0?utcMonday.ceil(week):utcMonday.floor(week);week=utcDay.offset(week,(d.V-1)*7);d.y=week.getUTCFullYear();d.m=week.getUTCMonth();d.d=week.getUTCDate()+(d.w+6)%7;}else{week=this._newDate(newYear(d.y));day$1=week.getDay();week=day$1>4||day$1===0?monday.ceil(week):monday.floor(week);week=day.offset(week,(d.V-1)*7);d.y=week.getFullYear();d.m=week.getMonth();d.d=week.getDate()+(d.w+6)%7;}}else if("W"in d||"U"in d){if(!("w"in d)){if("u"in d){d.w=d.u%7;}else{d.w="W"in d?1:0;}}day$1="Z"in d?utcDate(newYear(d.y)).getUTCDay():this._newDate(newYear(d.y)).getDay();d.m=0;d.d="W"in d?(d.w+6)%7+d.W*7-(day$1+5)%7:d.w+d.U*7-(day$1+6)%7;}if("Z"in d){d.H+=d.Z/100|0;d.M+=d.Z%100;return utcDate(d)}return this._newDate(d)};_proto.toString=function toString(){return this._specifier};return TimeParser}();

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var inheritsLoose = _inheritsLoose;

var YearInterval=function(_TimeInterval){inheritsLoose(YearInterval,_TimeInterval);function YearInterval(){return _TimeInterval.apply(this,arguments)||this}var _proto=YearInterval.prototype;_proto.every=function every(step){var stepi=Math.floor(step);if(!this.count||!Number.isFinite(stepi)||!(stepi>0)){return null}return new TimeInterval("year",(function(d){d.setFullYear(Math.floor(d.getFullYear()/stepi)*stepi);d.setMonth(0,1);d.setHours(0,0,0,0);}),(function(d,s){return d.setFullYear(d.getFullYear()+s*stepi)}))};return YearInterval}(TimeInterval);

var year=new YearInterval("year",(function(d){d.setMonth(0,1);d.setHours(0,0,0,0);}),(function(d,s){return d.setFullYear(d.getFullYear()+s)}),(function(s,e){return e.getFullYear()-s.getFullYear()}),(function(d){return d.getFullYear()}));

var UtcYearInterval=function(_TimeInterval){inheritsLoose(UtcYearInterval,_TimeInterval);function UtcYearInterval(){return _TimeInterval.apply(this,arguments)||this}var _proto=UtcYearInterval.prototype;_proto.every=function every(_step){var step=_step;if(!isFinite(step=Math.floor(step))||!(step>0)){return null}return new TimeInterval("year",(function(d){d.setUTCFullYear(Math.floor(d.getUTCFullYear()/step)*step);d.setUTCMonth(0,1);d.setUTCHours(0,0,0,0);}),(function(d,s){return d.setUTCFullYear(d.getUTCFullYear()+s*step)}))};return UtcYearInterval}(TimeInterval);

var utcYear=new UtcYearInterval("year",(function(d){d.setUTCMonth(0,1);d.setUTCHours(0,0,0,0);}),(function(d,s){return d.setUTCFullYear(d.getUTCFullYear()+s)}),(function(s,e){return e.getUTCFullYear()-s.getUTCFullYear()}),(function(d){return d.getUTCFullYear()}));

var enUS={dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};

var numberRe=/^\s*\d+/,quarterRe=/^\s*Q\d+/,percentRe=/^%/,requoteRe=/[\\^$*+?|[\]().{}]/g,pad=function pad(value,fill,width){var sign=value<0?"-":"",string=(sign?-value:value)+"",length=string.length,padStr=length<width?new Array(width-length+1).join(fill)+string:string;return sign+padStr},requote=function requote(s){return s.replace(requoteRe,"\\$&")},formatRe=function formatRe(names){return new RegExp("^(?:"+names.map(requote).join("|")+")","i")},formatLookup=function formatLookup(names){var map={},i=-1,n=names.length;while(++i<n){map[names[i].toLowerCase()]=i;}return map},parseWeekdayNumberSunday=function parseWeekdayNumberSunday(d,string,i){var n=numberRe.exec(string.slice(i,i+1));return n?(d.w=+n[0],i+n[0].length):-1},parseWeekdayNumberMonday=function parseWeekdayNumberMonday(d,string,i){var n=numberRe.exec(string.slice(i,i+1));return n?(d.u=+n[0],i+n[0].length):-1},parseWeekNumberSunday=function parseWeekNumberSunday(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.U=+n[0],i+n[0].length):-1},parseWeekNumberISO=function parseWeekNumberISO(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.V=+n[0],i+n[0].length):-1},parseWeekNumberMonday=function parseWeekNumberMonday(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.W=+n[0],i+n[0].length):-1},parseQuarter=function parseQuarter(d,string,i){var n=quarterRe.exec(string.slice(i,i+2));return n?(d.m=(n[0][1]-1)*3,i+n[0].length):-1},parseFullYear=function parseFullYear(d,string,i){var n=numberRe.exec(string.slice(i,i+4));return n?(d.y=+n[0],i+n[0].length):-1},parseYear=function parseYear(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.y=+n[0]+(+n[0]>68?1900:2e3),i+n[0].length):-1},parseZone=function parseZone(d,string,i){var n=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i,i+6));return n?(d.Z=n[1]?0:-(n[2]+(n[3]||"00")),i+n[0].length):-1},parseMonthNumber=function parseMonthNumber(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.m=n[0]-1,i+n[0].length):-1},parseDayOfMonth=function parseDayOfMonth(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.d=+n[0],i+n[0].length):-1},parseDayOfYear=function parseDayOfYear(d,string,i){var n=numberRe.exec(string.slice(i,i+3));return n?(d.m=0,d.d=+n[0],i+n[0].length):-1},parseHour24=function parseHour24(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.H=+n[0],i+n[0].length):-1},parseMinutes=function parseMinutes(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.M=+n[0],i+n[0].length):-1},parseSeconds=function parseSeconds(d,string,i){var n=numberRe.exec(string.slice(i,i+2));return n?(d.S=+n[0],i+n[0].length):-1},parseMilliseconds=function parseMilliseconds(d,string,i){var n=numberRe.exec(string.slice(i,i+3));return n?(d.L=+n[0],i+n[0].length):-1},parseMicroseconds=function parseMicroseconds(d,string,i){var n=numberRe.exec(string.slice(i,i+6));return n?(d.L=Math.floor(n[0]/1e3),i+n[0].length):-1},parseLiteralPercent=function parseLiteralPercent(d,string,i){var n=percentRe.exec(string.slice(i,i+1));return n?i+n[0].length:-1},parseUnixTimestamp=function parseUnixTimestamp(d,string,i){var n=numberRe.exec(string.slice(i));return n?(d.Q=+n[0],i+n[0].length):-1},parseUnixTimestampSeconds=function parseUnixTimestampSeconds(d,string,i){var n=numberRe.exec(string.slice(i));return n?(d.Q=+n[0]*1e3,i+n[0].length):-1},formatDayOfMonth=function formatDayOfMonth(d,p){return pad(d.getDate(),p,2)},formatHour24=function formatHour24(d,p){return pad(d.getHours(),p,2)},formatHour12=function formatHour12(d,p){return pad(d.getHours()%12||12,p,2)},formatDayOfYear=function formatDayOfYear(d,p){return pad(1+day.count(year.floor(d),d),p,3)},formatMilliseconds=function formatMilliseconds(d,p){return pad(d.getMilliseconds(),p,3)},formatMicroseconds=function formatMicroseconds(d,p){return formatMilliseconds(d,p)+"000"},formatMonthNumber=function formatMonthNumber(d,p){return pad(d.getMonth()+1,p,2)},formatMinutes=function formatMinutes(d,p){return pad(d.getMinutes(),p,2)},formatSeconds=function formatSeconds(d,p){return pad(d.getSeconds(),p,2)},formatQuarter=function formatQuarter(d,p){return "Q"+Math.ceil((d.getMonth()+1)/3)},formatWeekdayNumberMonday=function formatWeekdayNumberMonday(d){var day=d.getDay();return day===0?7:day},formatWeekNumberSunday=function formatWeekNumberSunday(d,p){return pad(sunday.count(year.floor(d),d),p,2)},formatWeekNumberISO=function formatWeekNumberISO(_d,p){var d=_d,day=d.getDay();d=day>=4||day===0?thursday.floor(d):thursday.ceil(d);return pad(thursday.count(year.floor(d),d)+(year.floor(d).getDay()===4),p,2)},formatWeekdayNumberSunday=function formatWeekdayNumberSunday(d){return d.getDay()},formatWeekNumberMonday=function formatWeekNumberMonday(d,p){return pad(monday.count(year.floor(d),d),p,2)},formatYear=function formatYear(d,p){return pad(d.getFullYear()%100,p,2)},formatFullYear=function formatFullYear(d,p){return pad(d.getFullYear()%1e4,p,4)},formatZone=function formatZone(d){var z=d.getTimezoneOffset();return (z>0?"-":(z*=-1,"+"))+pad(z/60|0,"0",2)+pad(z%60,"0",2)},formatUTCDayOfMonth=function formatUTCDayOfMonth(d,p){return pad(d.getUTCDate(),p,2)},formatUTCHour24=function formatUTCHour24(d,p){return pad(d.getUTCHours(),p,2)},formatUTCHour12=function formatUTCHour12(d,p){return pad(d.getUTCHours()%12||12,p,2)},formatUTCDayOfYear=function formatUTCDayOfYear(d,p){return pad(1+utcDay.count(utcYear.floor(d),d),p,3)},formatUTCMilliseconds=function formatUTCMilliseconds(d,p){return pad(d.getUTCMilliseconds(),p,3)},formatUTCMicroseconds=function formatUTCMicroseconds(d,p){return formatUTCMilliseconds(d,p)+"000"},formatUTCMonthNumber=function formatUTCMonthNumber(d,p){return pad(d.getUTCMonth()+1,p,2)},formatUTCMinutes=function formatUTCMinutes(d,p){return pad(d.getUTCMinutes(),p,2)},formatUTCSeconds=function formatUTCSeconds(d,p){return pad(d.getUTCSeconds(),p,2)},formatUTCQuarter=function formatUTCQuarter(d,p){return "Q"+Math.ceil((d.getUTCMonth()+1)/3)},formatUTCWeekdayNumberMonday=function formatUTCWeekdayNumberMonday(d){var dow=d.getUTCDay();return dow===0?7:dow},formatUTCWeekNumberSunday=function formatUTCWeekNumberSunday(d,p){return pad(utcSunday.count(utcYear.floor(d),d),p,2)},formatUTCWeekNumberISO=function formatUTCWeekNumberISO(_d,p){var d=_d,day=d.getUTCDay();d=day>=4||day===0?utcThursday.floor(d):utcThursday.ceil(d);return pad(utcThursday.count(utcYear.floor(d),d)+(utcYear.floor(d).getUTCDay()===4),p,2)},formatUTCWeekdayNumberSunday=function formatUTCWeekdayNumberSunday(d){return d.getUTCDay()},formatUTCWeekNumberMonday=function formatUTCWeekNumberMonday(d,p){return pad(utcMonday.count(utcYear.floor(d),d),p,2)},formatUTCYear=function formatUTCYear(d,p){return pad(d.getUTCFullYear()%100,p,2)},formatUTCFullYear=function formatUTCFullYear(d,p){return pad(d.getUTCFullYear()%1e4,p,4)},formatUTCZone=function formatUTCZone(){return "+0000"},formatLiteralPercent=function formatLiteralPercent(){return "%"},formatUnixTimestamp=function formatUnixTimestamp(d){return +d},formatUnixTimestampSeconds=function formatUnixTimestampSeconds(d){return Math.floor(+d/1e3)};var TimeConverter=function(){function TimeConverter(locale){var _this=this;var localeDateTime=locale.dateTime,localeDate=locale.date,localeTime=locale.time,localePeriods=locale.periods,localeWeekdays=locale.days,localeShortWeekdays=locale.shortDays,localeMonths=locale.months,localeShortMonths=locale.shortMonths,periodRe=formatRe(localePeriods),periodLookup=formatLookup(localePeriods),weekdayRe=formatRe(localeWeekdays),weekdayLookup=formatLookup(localeWeekdays),shortWeekdayRe=formatRe(localeShortWeekdays),shortWeekdayLookup=formatLookup(localeShortWeekdays),monthRe=formatRe(localeMonths),monthLookup=formatLookup(localeMonths),shortMonthRe=formatRe(localeShortMonths),shortMonthLookup=formatLookup(localeShortMonths);this._formats={a:function a(d){return localeShortWeekdays[d.getDay()]},A:function A(d){return localeWeekdays[d.getDay()]},b:function b(d){return localeShortMonths[d.getMonth()]},B:function B(d){return localeMonths[d.getMonth()]},d:formatDayOfMonth,e:formatDayOfMonth,f:formatMicroseconds,H:formatHour24,I:formatHour12,j:formatDayOfYear,L:formatMilliseconds,m:formatMonthNumber,M:formatMinutes,p:function p(d){return localePeriods[+(d.getHours()>=12)]},q:formatQuarter,Q:formatUnixTimestamp,s:formatUnixTimestampSeconds,S:formatSeconds,u:formatWeekdayNumberMonday,U:formatWeekNumberSunday,V:formatWeekNumberISO,w:formatWeekdayNumberSunday,W:formatWeekNumberMonday,y:formatYear,Y:formatFullYear,Z:formatZone,"%":formatLiteralPercent};this._utcFormats={a:function a(d){return localeShortWeekdays[d.getUTCDay()]},A:function A(d){return localeWeekdays[d.getUTCDay()]},b:function b(d){return localeShortMonths[d.getUTCMonth()]},B:function B(d){return localeMonths[d.getUTCMonth()]},d:formatUTCDayOfMonth,e:formatUTCDayOfMonth,f:formatUTCMicroseconds,H:formatUTCHour24,I:formatUTCHour12,j:formatUTCDayOfYear,L:formatUTCMilliseconds,m:formatUTCMonthNumber,M:formatUTCMinutes,p:function p(d){return localePeriods[+(d.getUTCHours()>=12)]},q:formatUTCQuarter,Q:formatUnixTimestamp,s:formatUnixTimestampSeconds,S:formatUTCSeconds,u:formatUTCWeekdayNumberMonday,U:formatUTCWeekNumberSunday,V:formatUTCWeekNumberISO,w:formatUTCWeekdayNumberSunday,W:formatUTCWeekNumberMonday,y:formatUTCYear,Y:formatUTCFullYear,Z:formatUTCZone,"%":formatLiteralPercent};this._parses={a:function a(d,string,i){var n=shortWeekdayRe.exec(string.slice(i));if(n){d.w=shortWeekdayLookup[n[0].toLowerCase()];return i+n[0].length}return -1},A:function A(d,string,i){var n=weekdayRe.exec(string.slice(i));if(n){d.w=weekdayLookup[n[0].toLowerCase()];return i+n[0].length}return -1},b:function b(d,string,i){var n=shortMonthRe.exec(string.slice(i));if(n){d.m=shortMonthLookup[n[0].toLowerCase()];return i+n[0].length}return -1},B:function B(d,string,i){var n=monthRe.exec(string.slice(i));if(n){d.m=monthLookup[n[0].toLowerCase()];return i+n[0].length}return -1},c:null,d:parseDayOfMonth,e:parseDayOfMonth,f:parseMicroseconds,H:parseHour24,I:parseHour24,j:parseDayOfYear,L:parseMilliseconds,m:parseMonthNumber,M:parseMinutes,p:function p(d,string,i){var n=periodRe.exec(string.slice(i));if(n){d.p=periodLookup[n[0].toLowerCase()];return i+n[0].length}return -1},Q:parseUnixTimestamp,q:parseQuarter,s:parseUnixTimestampSeconds,S:parseSeconds,u:parseWeekdayNumberMonday,U:parseWeekNumberSunday,V:parseWeekNumberISO,w:parseWeekdayNumberSunday,W:parseWeekNumberMonday,x:null,X:null,y:parseYear,Y:parseFullYear,Z:parseZone,"%":parseLiteralPercent};this._formats.x=function(d){return new TimeFormatter(localeDate,_this._formats).format(d)};this._formats.X=function(d){return new TimeFormatter(localeTime,_this._formats).format(d)};this._formats.c=function(d){return new TimeFormatter(localeDateTime,_this._formats).format(d)};this._utcFormats.x=function(d){return new TimeFormatter(localeDate,_this._utcFormats).format(d)};this._utcFormats.X=function(d){return new TimeFormatter(localeTime,_this._utcFormats).format(d)};this._utcFormats.c=function(d){return new TimeFormatter(localeDateTime,_this._utcFormats).format(d)};this._parses.c=function(d,string,i){return new TimeParser(localeDateTime,_this._parses).parseSpecifier(d,string,i)};this._parses.x=function(d,string,i){return new TimeParser(localeDate,_this._parses).parseSpecifier(d,string,i)};this._parses.X=function(d,string,i){return new TimeParser(localeTime,_this._parses).parseSpecifier(d,string,i)};}var _proto=TimeConverter.prototype;_proto.formatter=function formatter(specifier){if(specifier===void 0){specifier="";}return new TimeFormatter(specifier.toString(),this._formats)};_proto.utcFormatter=function utcFormatter(specifier){if(specifier===void 0){specifier="";}return new TimeFormatter(specifier.toString(),this._utcFormats)};_proto.parser=function parser(_specifier){var specifier=_specifier;return new TimeParser(specifier+="",this._parses,(function(d){if(d.y>=0&&d.y<100){var date=new Date(-1,d.m,d.d,d.H,d.M,d.S,d.L);date.setFullYear(d.y);return date}return new Date(d.y,d.m,d.d,d.H,d.M,d.S,d.L)}))};_proto.utcParser=function utcParser(_specifier){var specifier=_specifier;return new TimeParser(specifier+="",this._parses,utcDate)};return TimeConverter}();var TimeConverter$1 = new TimeConverter(enUS);

var UNDEF;function columnIndexOf(columnName,schema){if(!schema||!columnName)return null;for(var i=0;i<schema.length;i++){if(schema[i]&&schema[i].hasOwnProperty("name")&&schema[i].name===columnName){return i}}return -1}function columnMinValue(columnName,data,schema){var columnIndex,minVal;columnIndex=columnIndexOf(columnName,schema);if(columnIndex===null||columnIndex===-1){return null}if(data&&data.length>0){var valToCheck;minVal=Number.POSITIVE_INFINITY;for(var i=0;i<data.length;i++){valToCheck=schema[columnIndex].type==="interval"?data[i][columnIndex]?data[i][columnIndex].start:null:data[i][columnIndex];if(isNumber(valToCheck)&&valToCheck<minVal){minVal=valToCheck;}}}return minVal}function columnMaxValue(columnName,data,schema){var columnIndex,maxVal;columnIndex=columnIndexOf(columnName,schema);if(columnIndex===null||columnIndex===-1){return null}if(data&&data.length>0){var valToCheck;maxVal=Number.NEGATIVE_INFINITY;for(var i=0;i<data.length;i++){valToCheck=schema[columnIndex].type==="interval"?data[i][columnIndex]?data[i][columnIndex].end:null:data[i][columnIndex];if(isNumber(valToCheck)&&valToCheck>maxVal){maxVal=valToCheck;}}}return maxVal}function columnMinDiff(columnName,data,schema,indexBy){var columnIndex,dataClone=data,dataLength=data.length,minDiff;columnIndex=columnIndexOf(columnName,schema);if(columnIndex===null||columnIndex===-1){return null}if(schema[columnIndex]&&["date","number"].indexOf(schema[columnIndex].type)<0)throw new Error("Operation valid only on date or number columns");if(!indexBy||columnName!==indexBy){dataClone=data.slice(0);dataClone.sort((function(a,b){return numberComparator(a[columnIndex],b[columnIndex])}));}if(dataClone&&dataLength>0){var valToCheck,a,b;minDiff=Number.POSITIVE_INFINITY;for(var i=0;i<dataClone.length-1;i++){a=dataClone[i][columnIndex];b=dataClone[i+1][columnIndex];if(isNumber(b)&&isNumber(a)){valToCheck=b-a;minDiff=isNumber(valToCheck)&&valToCheck>=0&&valToCheck<minDiff?valToCheck:minDiff;if(minDiff===0)break}else{break}}}return minDiff===Number.POSITIVE_INFINITY?null:minDiff}function columnExtents(columnName,data,schema){var min=Number.POSITIVE_INFINITY,max=Number.NEGATIVE_INFINITY,columnIndex=columnIndexOf(columnName,schema),valToCheck;if(columnIndex===null||columnIndex===-1){return null}if(data&&data.length>0){for(var i=0;i<data.length;i++){valToCheck=schema[columnIndex].type==="interval"?data[i][columnIndex]?data[i][columnIndex].start:null:data[i][columnIndex];if(isNumber(valToCheck)&&valToCheck<min){min=valToCheck;}valToCheck=schema[columnIndex].type==="interval"?data[i][columnIndex]?data[i][columnIndex].end:null:data[i][columnIndex];if(isNumber(valToCheck)&&valToCheck>max){max=valToCheck;}}}return {min:min,max:max}}function columnUnique(columnName,data,schema){var columnIndex=columnIndexOf(columnName,schema),uniqueVals=[],uniqueList;if(columnIndex===null||columnIndex===-1){return []}for(var i=0;i<data.length;i++){uniqueVals.push(data[i][columnIndex]);}if(data&&data.length>0){uniqueList=Array.from(new Set(uniqueVals));return uniqueList.length===1&&typeof uniqueList[0]==="undefined"?[]:uniqueList}return []}function addColumnsSchema(schema,columnConfigs){var columnConfigsLen=columnConfigs.length,schemaCopy=schema.slice(0);for(var i=0;i<columnConfigsLen;i++){var schemaLen=schemaCopy.length;columnConfigs[i].originalName=columnConfigs[i].name;for(var j=0;j<schemaLen;j++){if(columnConfigs[i].name===schemaCopy[j].name){columnConfigs[i].i=columnConfigs[i].i&&++columnConfigs[i].i||1;columnConfigs[i].name=columnConfigs[i].originalName+" "+columnConfigs[i].i;}if(!columnConfigs[i].type||["string","number","date"].indexOf(columnConfigs[i].type)===-1){columnConfigs[i].type="string";}}delete columnConfigs[i].originalName;delete columnConfigs[i].i;schemaCopy.push({name:columnConfigs[i].name,type:columnConfigs[i].type||"string"});if(columnConfigs[i].calcFn){schemaCopy[schemaCopy.length-1].calcFn=columnConfigs[i].calcFn;}if(columnConfigs[i].format){schemaCopy[schemaCopy.length-1].format=columnConfigs[i].format;}if(columnConfigs[i].enableUTC){schemaCopy[schemaCopy.length-1].enableUTC=columnConfigs[i].enableUTC;}columnConfigs[i].columnIndex=schemaCopy.length-1;}return {schema:schemaCopy,calcColumns:columnConfigs}}function addColumnsData(data,schema,columnConfigs){var dataLen=data.length,columnConfigsLen=columnConfigs.length,schemaLen=schema.length,columns={},cellData,dateColumnsAndFormatter=buildDateColumnsFormatter(columnConfigs);for(var i=0;i<schemaLen;i++){columns[schema[i].name]=i;}for(var _i=0;_i<dataLen;_i++){for(var j=0;j<columnConfigsLen;j++){if(columnConfigs[j].calcFn){cellData=columnConfigs[j].calcFn(data[_i],columns,_i);cellData=_parseCell(columnConfigs[j],cellData,dateColumnsAndFormatter);data[_i][columnConfigs[j].columnIndex]=cellData;}}}return data}function _parseCell(colConfig,val,dateColumnsAndFormatter){if(dateColumnsAndFormatter[colConfig.name]!==UNDEF&&val){if(dateColumnsAndFormatter[colConfig.name]){return +dateColumnsAndFormatter[colConfig.name].parse(val)}return +new Date(val)}else if(colConfig.type==="number"){if(isNumber(val)){return val}else if(!val){return null}return parseFloat(val)}return val}function parseAndIndexData(data,schema,config){var dateColumnsAndFormatter=buildDateColumnsFormatter(schema),parsedData=parseData(data,schema,dateColumnsAndFormatter);indexData(parsedData,schema,config,dateColumnsAndFormatter);return parsedData}function buildDateColumnsFormatter(schema){var dateColumnsAndFormatter={};for(var i=0;i<schema.length;i++){if(!schema[i].name){throw new Error("Input schema is not in a correct format - each column must have a name")}if(schema[i].type&&schema[i].type==="date"){dateColumnsAndFormatter[schema[i].name]=schema[i].format?(schema[i].enableUTC!==UNDEF?schema[i].enableUTC:getConfig("enableUTC"))?TimeConverter$1.utcParser(schema[i].format):TimeConverter$1.parser(schema[i].format):null;}}return dateColumnsAndFormatter}function parseData(data,schema,dateColFormatter){var parsedData=[];if(data.length>0){var dateColumnsAndFormatter=dateColFormatter,i;if(!dateColumnsAndFormatter){dateColumnsAndFormatter=buildDateColumnsFormatter(schema);}try{var columnLength=schema.length,arr,element,arrLen;for(var n=0;n<data.length;n++){arr=[];element=data[n];if(element.constructor===Array){arrLen=Math.min(columnLength,element.length);for(i=0;i<arrLen;i++){arr[i]=_parseCell(schema[i],element[i],dateColumnsAndFormatter);}}else if(typeof element==="object"){for(i=0;i<columnLength;i++){if(element[schema[i].name]){arr[i]=_parseCell(schema[i],element[schema[i].name],dateColumnsAndFormatter);}}}else{continue}parsedData.push(arr);}}catch(e){throw new Error("Error while parsing the data - "+e)}}return parsedData}function indexData(parsedData,schema,config,dateColFormatter){if(config.enableIndex){var i,comparator,dateColumnsAndFormatter;if(!config.indexBy){dateColumnsAndFormatter=dateColFormatter;if(!dateColumnsAndFormatter){dateColumnsAndFormatter=buildDateColumnsFormatter(schema);}var dateColumns=Object.keys(dateColumnsAndFormatter);if(dateColumns.length>0){config.indexBy=dateColumns[0];}else{for(i=0;i<schema.length;i++){if(schema[i].type&&schema[i].type==="number"){config.indexBy=schema[i].name;break}}if(i===schema.length){config.indexBy=schema[0].name;}}}for(i=0;i<schema.length;i++){if(schema[i]&&schema[i].name===config.indexBy){break}}if(i===schema.length){throw new Error("Index column is not found in schema")}switch(schema[i].type){case"number":case"date":comparator=numberComparator;break;default:comparator=stringComparator;break}timSort(parsedData,(function(a,b){return comparator(a[i],b[i])}));}}function createTableID(tableIdArr){var tableIdLen=tableIdArr.length,counter=tableIdLen+1;while(tableIdArr.includes("table-"+counter)){counter++;}return "table-"+counter}function isUTCEnabled(columnName,schema){var columnIndex;columnIndex=columnIndexOf(columnName,schema);if(columnIndex===null||columnIndex===-1||schema[columnIndex].type!=="date"&&schema[columnIndex].type!=="interval"){return null}return schema[columnIndex].enableUTC!==UNDEF?schema[columnIndex].enableUTC:getConfig("enableUTC")}

function addHandler(eventName,handler,sender){var attachedHandlersLen;if(handler instanceof Array){var recurseReturn=[],handlerLen=handler.length;for(var i=0;i<handlerLen;i+=1){recurseReturn.push(addHandler(eventName,handler[i],sender));}return recurseReturn}if(!eventName||typeof eventName!=="string")throw new Error("eventName must be a non-empty string");if(typeof handler!=="function")throw new Error("handler must be a function");if(!(sender instanceof Object))throw new Error("sender must be an object");sender._evtHandlers=sender._evtHandlers||{};if(!sender._evtHandlers[eventName]||!(sender._evtHandlers[eventName]instanceof Array)){sender._evtHandlers[eventName]=[];}attachedHandlersLen=sender._evtHandlers[eventName].length;for(var _i=0;_i<attachedHandlersLen;_i++){if(sender._evtHandlers[eventName][_i]===handler){return false}}sender._evtHandlers[eventName].push(handler);return true}function getHanlders(eventName,sender){if(typeof eventName!=="string")throw new Error("eventName must be a non-empty string");if(!(sender instanceof Object))throw new Error("sender must be an object");return sender._evtHandlers&&sender._evtHandlers[eventName]||[]}function removeHandler(eventName,handler,sender){var attachedHandlers,attachedHandlersLen;if(handler instanceof Array){var recurseReturn=[],handlerLen=handler.length;for(var i=0;i<handlerLen;i+=1){recurseReturn.push(removeHandler(eventName,handler[i],sender));}return recurseReturn}if(!eventName||typeof eventName!=="string")throw new Error("eventName must be a non-empty string");if(handler&&typeof handler!=="function")throw new Error("handler must be a function");if(!(sender instanceof Object))throw new Error("sender must be an object");attachedHandlers=getHanlders(eventName,sender);if(!(attachedHandlers instanceof Array)||attachedHandlers.length===0){return}if(!handler){delete sender._evtHandlers[eventName];return true}attachedHandlersLen=attachedHandlers.length;for(var _i2=0;_i2<attachedHandlersLen;_i2++){if(attachedHandlers[_i2]===handler){attachedHandlers.splice(_i2,1);}}return true}function triggerEvent(eventName,sender,args){var attachedHandlers,attachedHandlersLen,eventObj;if(!eventName||typeof eventName!=="string")throw new Error("eventName must be a non-empty string");if(!(sender instanceof Object))throw new Error("sender must be an object");attachedHandlers=getHanlders(eventName,sender);eventObj={eventName:eventName,sender:sender,data:args};if(!(attachedHandlers instanceof Array)||attachedHandlers.length===0){return}attachedHandlersLen=attachedHandlers.length;for(var i=0;i<attachedHandlersLen;i++){attachedHandlers[i](eventObj);}return true}

var UNDEF$1;var DataTable=function(){function DataTable(dataStore,data,schema,config,parentTable,opsFunnel,id){this._dataStore=dataStore;this._parentTable=parentTable;this._children=[];this._childrenTableIDs=[];this._opsFunnel=opsFunnel;this._data=data||[];this._schema=schema;this._config=config;this._id=id;var counter=1,baseID;if(!this._id){baseID=this._parentTable&&this._parentTable._id?this._parentTable._id:"table_1";this._id=baseID+"_"+counter;}if(this._parentTable){while(this._parentTable._childrenTableIDs.includes(this._id)){if(baseID){this._id=baseID+"_"+ ++counter;}else{this._id=this._id+"_1";}}this._parentTable._children.push(this);this._parentTable._childrenTableIDs.push(this._id);}this._result=null;}var _proto=DataTable.prototype;_proto._appendRows=function _appendRows(rows){var childrenLength=this._children&&this._children.length||0,schemaLength=this._result&&this._result.schema.length||0;if(schemaLength)this._calcColumns=[];for(var i=0;i<schemaLength;i++){if(this._result.schema[i].calcFn){this._calcColumns.push(this._result.schema[i]);}}if(this._result){delete this._result;}for(var _i=0;_i<childrenLength;_i++){this._children[_i]._appendRows(rows);}};_proto.count=function count(){var result=this._executeFunnel();return result.data.length};_proto.getSchema=function getSchema(){var result=this._executeFunnel();return result.schema};_proto.getID=function getID(){return this._id};_proto.getDataStore=function getDataStore(){return this._dataStore};_proto.getChildren=function getChildren(id){if(id){for(var i=0;i<this._children.length;i++){if(this._children[i]._id===id){return this._children[i]}}return null}return this._children};_proto.getData=function getData(_offset,_numberOfItems){var offset=_offset,numberOfItems=_numberOfItems,result;offset=offset||0;numberOfItems=numberOfItems&&(typeof numberOfItems==="string"||numberOfItems instanceof String)||numberOfItems===null?UNDEF$1:numberOfItems;result=this._executeFunnel();return {data:result.data&&result.data.slice(offset,numberOfItems&&numberOfItems>0?offset+numberOfItems:numberOfItems),schema:result.schema}};_proto.dispose=function dispose(){var instance=this,childrenLength=instance._children&&instance._children.length||0;if(instance._parentTable&&instance._parentTable._children){var i;for(i=0;i<instance._parentTable._children.length;i++){if(typeof instance._id!=="undefined"&&instance._id===instance._parentTable._children[i]._id){break}}if(i!==instance._parentTable._children.length){instance._parentTable._children.splice(i,1);}}delete instance._dataStore;delete instance._parentTable;delete instance._opsFunnel;delete instance._data;delete instance._schema;delete instance._config;delete instance._result;delete instance._id;for(var _i2=childrenLength-1;_i2>=0;_i2--){instance._children[_i2].dispose();}delete instance._children;delete instance._childrenTableIDs;instance._trigger("disposed");delete instance._evtHandlers;instance=null;};_proto.min=function min(columnName){var dtData=this.getData();return columnMinValue(columnName,dtData.data,dtData.schema)};_proto.max=function max(columnName){var dtData=this.getData();return columnMaxValue(columnName,dtData.data,dtData.schema)};_proto.unique=function unique(columnName){var dtData=this.getData();return columnUnique(columnName,dtData.data,dtData.schema)};_proto.extents=function extents(columnName){var dtData=this.getData();return columnExtents(columnName,dtData.data,dtData.schema)};_proto.addColumns=function addColumns(){for(var _len=arguments.length,columnConfigs=new Array(_len),_key=0;_key<_len;_key++){columnConfigs[_key]=arguments[_key];}var columnConfigsLen=columnConfigs.length;if(columnConfigsLen>0){this._calcColumns=this._calcColumns||[];for(var i=0;i<columnConfigsLen;i++){if(!columnConfigs[i].name)throw new Error("name is required in column "+(i+1));if(columnConfigs[i].calcFn&&!(columnConfigs[i].calcFn instanceof Function))throw new Error("calcFn must be a function in column "+(i+1));if(!columnConfigs[i].calcFn){columnConfigs[i].calcFn=function(){return UNDEF$1};}this._calcColumns.push(Object.assign({},columnConfigs[i]));}}this._trigger("updated",columnConfigs);};_proto.query=function query(_operations){var operations=_operations,dataTable;if(operations&&operations.constructor!==Array){operations=[operations];}dataTable=new DataTable(this._dataStore,this._data,this._schema,this._config,this,operations);return dataTable};_proto.indexOf=function indexOf(columnName){var result=this._executeFunnel();return columnIndexOf(columnName,result.schema)};_proto.on=function on(eventName,handlers){addHandler(eventName,handlers,this);};_proto.off=function off(eventName,handlers){removeHandler(eventName,handlers,this);};_proto._trigger=function _trigger(eventName,data){triggerEvent(eventName,this,data);};_proto._executeFunnel=function _executeFunnel(){if(!this._result){if(this._opsFunnel){var parentResult,data,schema,config,funnelLen;parentResult=this._parentTable._executeFunnel();data=parentResult.data.slice(0);schema=parentResult.schema.slice(0);config=Object.assign({},parentResult.config);funnelLen=this._opsFunnel.length;for(var i=0;i<funnelLen;i++){if(this._opsFunnel[i]&&this._opsFunnel[i].fn){var result=this._opsFunnel[i].fn(data,schema,config);data=result.generatorFn?result.generatorFn():result.data;schema=result.schema;config=Object.assign(config,result.config);if(config.indexBy===UNDEF$1)config.enableIndex=false;}}this._result={data:data,schema:schema,config:config};}else{this._result={data:this._data,schema:this._schema,config:this._config};}}if(this._calcColumns&&this._calcColumns.length>0){var columnConfigs=addColumnsSchema(this._result.schema,this._calcColumns);this._result.schema=columnConfigs.schema;this._result.data=addColumnsData(this._result.data,this._result.schema,columnConfigs.calcColumns);delete this._calcColumns;}return this._result};_proto._flushResult=function _flushResult(data){var schemaLength=this._result&&this._result.schema.length||0;if(schemaLength)this._calcColumns=[];for(var i=0;i<schemaLength;i++){if(this._result.schema[i].calcFn){this._calcColumns.push(this._result.schema[i]);}}if(this._result){this._result=null;}if(this._children){for(var _i3=0;_i3<this._children.length;_i3++){this._children[_i3]._flushResult(data);}}this._trigger("resultFlushed",data);};_proto.propagate=function propagate(payload){this.getDataStore()._propagate({trigger:this,payload:payload});};_proto._payloadReceiver=function _payloadReceiver(payload){var childrenLength=this._children&&this._children.length||0;if(payload&&payload.trigger&&payload.trigger!==this){this._trigger("payloadReceived",payload);}for(var i=0;i<childrenLength;i++){this._children[i]._payloadReceiver(payload);}};_proto.getMinDiff=function getMinDiff(columnName){var dtData=this.getData();return columnMinDiff(columnName,dtData.data,dtData.schema,this._config.indexBy)};_proto.isUTCEnabled=function isUTCEnabled$1(columnName){return isUTCEnabled(columnName,this.getSchema())};return DataTable}();

var DataStore=function(){function DataStore(data,schema,config){this.dataTables={};this._defaultDataTable=null;this._id=+new Date+"";if(data&&schema&&data.constructor===Array&&schema.constructor===Array){this.createDataTable(data,schema,config);}}var _proto=DataStore.prototype;_proto.createDataTable=function createDataTable(data,schema,config,_id){if(!data||!schema){throw new Error("Both data and schema must be provided to build DataTable")}if(data.constructor!==Array){throw new Error("Data must be provided in 2D array format or array of json objects")}if(schema.constructor!==Array||schema.length===0){throw new Error("Input schema is not in a correct format - schema must be an array of column configurations")}var configObj={},parsedRows,dataTable,tableIdArr,id=_id;tableIdArr=Object.keys(this.dataTables);if(id){if(tableIdArr.includes(id)){throw new Error("A table with the id "+id+" already exists in the DataStore. Please use a different id.")}}else{id=createTableID(tableIdArr);}Object.assign(configObj,{enableIndex:true,enableUTC:false},config);parsedRows=parseAndIndexData(data,schema,configObj);dataTable=new DataTable(this,parsedRows,schema,configObj,null,null,id);if(tableIdArr.length===0){this._defaultDataTable=dataTable;}this.dataTables[id]=dataTable;return dataTable};_proto.appendRows=function appendRows(rows,id){var _dataTable$_data;var dataTable=this.getDataTable(id),parsedRows,schema,dateColumnsAndFormatter;schema=dataTable.getSchema();dateColumnsAndFormatter=buildDateColumnsFormatter(schema);parsedRows=parseData(rows,schema,dateColumnsAndFormatter);(_dataTable$_data=dataTable._data).push.apply(_dataTable$_data,parsedRows);indexData(dataTable._data,schema,dataTable._config,dateColumnsAndFormatter);dataTable._appendRows(parsedRows);this.trigger("itemsAdded",{rows:rows,tableID:id});};_proto.getDataTable=function getDataTable(id){if(id){if(!this.dataTables[id]){throw new Error("DataTable with id "+id+" is not found in the DataStore.")}return this.dataTables[id]}return this._defaultDataTable};_proto.on=function on(eventName,handlers){addHandler(eventName,handlers,this);};_proto.off=function off(eventName,handlers){removeHandler(eventName,handlers,this);};_proto.trigger=function trigger(eventName,data){triggerEvent(eventName,this,data);};_proto.dispose=function dispose(){var instance=this;for(var tableId in instance.dataTables){instance.dataTables[tableId].dispose();delete instance.dataTables[tableId];}delete instance._id;delete instance.dataTables;delete instance._defaultDataTable;this.trigger("disposed");instance=null;};_proto._propagate=function _propagate(payload){var instance=this;this.trigger("payloadReceived",payload);for(var tableId in instance.dataTables){instance.dataTables[tableId]._payloadReceiver(payload);}};return DataStore}();

let data = [
[1973, "January",0.00005,0.000769],
[1973, "February",0.00005,0.000719],
[1973, "March",0.000075,0.000818],
[1973, "April",0.0001,0.000868],
[1973, "May",0.00025,0.002802],
[1973, "June",0.000075,0.00243],
[1973, "July",0.00005,0.00181],
[1973, "August",0.0002,0.002182],
[1973, "September",0.0006,0.004042],
[1973, "October",0.000975,0.004439],
[1973, "November",0.000375,0.003398],
[1973, "December",0.000375,0.002852],
[1974, "January",0.00275,0.005506],
[1974, "February",0.004175,0.004365],
[1974, "March",0.001075,0.007366],
[1974, "April",0.00285,0.007638],
[1974, "May",0.0023,0.008506],
[1974, "June",0.00175,0.007812],
[1974, "July",0.003,0.006894],
[1974, "August",0.01225,0.006547],
[1974, "September",0.003225,0.007614],
[1974, "October",0.006625,0.011532],
[1974, "November",0.008225,0.007514],
[1974, "December",0.003775,0.006498],
[1975, "January",0.002275,0.011086],
[1975, "February",0.00375,0.011284],
[1975, "March",0.00495,0.005258],
[1975, "April",0.00165,0.0031],
[1975, "May",0.0024,0.005853],
[1975, "June",0.000925,0.001761],
[1975, "July",0.000075,0.001488],
[1975, "August",0.003225,0.000347],
[1975, "September",0.00105,0.000198],
[1975, "October",0.000025,0.000645],
[1975, "November",0.00095,0.00181],
[1975, "December",0.002225,0.002282],
[1976, "January",0.002575,0.000372],
[1976, "February",0.00285,0.00057],
[1976, "March",0.001,0.000273],
[1976, "April",0.0033,0.000546],
[1976, "May",0.00225,0.000595],
[1976, "June",0.0048,0.001736],
[1976, "July",0.000975,0.002306],
[1976, "August",0.00225,0.006696],
[1976, "September",0.001625,0.004836],
[1976, "October",0.00235,0.007886],
[1976, "November",0.003725,0.003522],
[1976, "December",0.002375,0.003174],
[1977, "January",0.003075,0.00062],
[1977, "February",0.001875,0.001314],
[1977, "March",0.000775,0.000868],
[1977, "April",0.00425,0.000694],
[1977, "May",0.00235,0.002678],
[1977, "June",0.0023,0.004018],
[1977, "July",0.0028,0.004712],
[1977, "August",0.0025,0.00429],
[1977, "September",0.004375,0.006994],
[1977, "October",0.00685,0.007911],
[1977, "November",0.00425,0.004315],
[1977, "December",0.005775,0.006944],
[1978, "January",0.003475,0.002678],
[1978, "February",0.003975,0.002728],
[1978, "March",0.005775,0.005952],
[1978, "April",0.010425,0.012102],
[1978, "May",0.008075,0.026015],
[1978, "June",0.007275,0.010168],
[1978, "July",0.007825,0.014979],
[1978, "August",0.005675,0.01364],
[1978, "September",0.0049,0.013987],
[1978, "October",0.009275,0.015153],
[1978, "November",0.00245,0.014037],
[1978, "December",0.0047,0.010466],
[1979, "January",0.00465,0.004363],
[1979, "February",0.006311,0.005027],
[1979, "March",0.003074,0.003907],
[1979, "April",0.004028,0.007247],
[1979, "May",0.002791,0.013075],
[1979, "June",0.005224,0.01404],
[1979, "July",0.002204,0.011549],
[1979, "August",0.008001,0.012496],
[1979, "September",0.00449,0.011929],
[1979, "October",0.003792,0.007439],
[1979, "November",0.003255,0.00421],
[1979, "December",0.003654,0.003282],
[1980, "January",0.003017,0.004336],
[1980, "February",0.004834,0.001324],
[1980, "March",0.002326,0.001243],
[1980, "April",0.001581,0.001396],
[1980, "May",0.005177,0.000221],
[1980, "June",0.002601,0.001501],
[1980, "July",0.000798,0.000577],
[1980, "August",0.004142,0.00284],
[1980, "September",0.000057,0.00089],
[1980, "October",0.003487,0.000287],
[1980, "November",0.000067,0.001398],
[1980, "December",0.001753,0.000318],
[1981, "January",0.000884,0.001961]
],
schema = [{
  "name": "Year",
  "type": "number"
}, {
  "name": "Month",
  "type": "string"
},{
  "name": "Coal Imports",
  "type": "number"
},{
  "name": "Coal Coke Imports",
  "type": "number"
}
];
function getDataTable () {
  let ds = new DataStore(),
    dt = ds.createDataTable(data, schema);
  return dt;
}

var utils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getDataTable: getDataTable
});

var grid_svelte_1 = getCjsExportFromNamespace(grid);

var gridWrapper = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
class GridWrapper {
    constructor() {
        this.state = {
            datatable: utils.getDataTable()
        };
    }
    render() {
        let gridComp = new grid_svelte_1({
            target: document.body,
            props: {
                dataSource: this.state.datatable.getData()
            }
        });
    }
}
exports.default = GridWrapper;
//# sourceMappingURL=grid-wrapper.js.map
});

var gridWrapper$1 = unwrapExports(gridWrapper);

export default gridWrapper$1;
//# sourceMappingURL=grid-wrapper.js.map
