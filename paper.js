const doc = document,
      log = (...x)=> console.log(x),
      qu  = (Q) => doc.querySelector(Q),
      quAll = (Q) => doc.querySelectorAll(Q),
      queryNot = (q)=>(n)=> quAll(`${q}:not(${n})`),  //SPECIAL not query
      dce = (el) => doc.createElement(el),
      escapeHTML =(str)=> new Option(str).innerHTML,
      escapeRegexToRegex = (str)=> (str.search(/W/) > -1) ? new RegExp(str.split('').map( x=> (x.search(/W/) > -1 && x != ' ') ? (``+x) : x ).join(''), 'g' ) : str,
      escapeRegex = (str)=> (str.search(/W/) > -1) ? str.split('').map( x=> (x.search(/W/) > -1 && x != ' ') ? (``+x) : x ).join('') : str,
      getMethods = (x) => Object.getOwnPropertyNames(x.__proto__),
      bigger = (a)=> (b)=> (a < b) ? b : a,
      OR = (a)=> (b)=> (a < 0) ? b : (a || b),  //compares if a is negative return other value , in all other bahave as usual
      appendAll = (papa, A) => A.forEach( x=> papa.appendChild(x) ),
      chain = (x) => (x)=> (x),  //chain multiple actions
      show_this = (it, mechanism)=> (mechanism) ? it.style.display = mechanism || 'block' : it.style.display = 'none',
      getAllProperties = (thing, props = [] ) => thing.__proto__ ? getAllProperties(thing.__proto__, props.concat( Object.getOwnPropertyNames(thing)) ) : [...new Set(props.concat(  Object.getOwnPropertyNames(thing) ))];

const $$ = {
    vars  : {
    //LOADED FILE and WHAT IS IN GALLERY
     FILES : {
        gallery : [],
        loaded : {}
     },
     gestures : ['mousedown', 'mousemove', 'mouseup'],
     toolSize : {
             'pen'    : 5,
             'pencil' : 4,
             'line'   : 2,
             'marker' : 25,
             'crayon' : 20,
             'select' : 1,
             'eraser' : 15,
       'text-to-paper': 12,
         'smart_text' : 10,
     },
     cutImage : null,
     DUMMY : null,
     uploaded_TEXT : ``, //uploaded file text instead of image
     STT : ``,  //smart_text text
     COLOR_DETECTOR : false,
     RESPONSE : null,
     color : '#000000',
     type : 'pen',
     DRAWING : false,
     draw_size : 5,
     extension : 'png',
     mouse : {
           x : 0,
           y:  0
     },
     shape : {
       width : 0,
       height : 0
     },
     historyIndex : -1,
     drawHistory  : [],
     savedImageData   : null,
     sidebarOffset : qu('.sidebar').clientWidth,
    },
    query : {},
      collectQuery : function(){
            $$.query = {
              container : qu('.container'),
              restovi   : qu('.restovi'),
              paperHolder : qu('.paper-holder'),
              paper     : qu('#paper'),   //canvas
              sidebar   : qu('.sidebar'),
              tracker   : qu('.tracker'),
              restovi   : qu('.restovi'),
              cp        : qu('#color-picker'), //canvas
              dm        : qu('.delete-mode'),
              save      : qu('.save'),
              pointControl : qu('.point-control'),
            }
    },
    // # EVERY TOOL HAS ITS OWN SIZE, which you can change anytime
    updateToolSize : (name, val=$$.vars.toolSize[name] )=> {
                      $$.vars.toolSize[name] = val | 0;
                      $$.query.pointControl.value = $$.vars.toolSize[name];
                      $$.vars.draw_size = $$.vars.toolSize[name];
                    },
    //STRIP CLASS FROM GROUP OF ELEMENT
    stripClass : function(group, _class, exception){
             for(let i = 0;i< group.length;i++) { group[i].classList.remove(_class); }

             if(exception != null) exception.classList.add(_class);
    },
    // CHECK IF CANVAS IS EMPTY (if empty it will return null)
    isCanvasEmpty : function(it){
              let arr = it.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
              for(let i = 0;i< arr.data.length;i++){
                  if(arr.data[i] > 0) return 'not-empty'; //STOP
              }
              return null;
    },
    openGallery : function(){
              let gal = qu('.gallery-holder');
              ( gal && gal.style.display == 'block' ) ? show_this(gal,'none') : show_this(gal,'block');

               if(gal.style.display == 'block')  $$.readGallery();
    },
    openPicker : function(){
              let picker = qu('.color-picker');
              ( picker && picker.style.display == 'grid' ) ? show_this(picker,'none') : show_this(picker,'grid');
    },
    openHelp : function(){
              let hh = qu('.help-holder');
              ( hh && hh.style.display == 'block' ) ? show_this(hh,'none') : show_this(hh,'block');
    },
    fillHelp : function(){
              let ok = Object.keys(HELP);
              let ov = Object.values(HELP);
              let table = dce('table');
              for(let i = 0;i< ok.length;i++){
                  let row = dce('tr');
                  let td1 = dce('td');
                  let td2 = dce('td');
                  td1.innerHTML = ok[i];
                  td1.setAttribute('ref', ok[i] );
                  td2.innerHTML = HELP[ok[i]];
                  row.appendChild(td1); row.appendChild(td2);
                  table.appendChild(row);
              }
              qu('.help-holder').appendChild(table);
    },
    //HEADERS
    generateHeaders : function(link){
                return fetch(link).then( x=> {
                      let ARR = [];
                      for(let [key, value] of x.headers) ARR.push(`${key} = ${value}`)
                         return ARR.filter( y => y.search(/length|type|date|modified/) > -1 )     //ARR.push(`${key}${value}`);
                 });
    },
    loadBrush : (link, IMG=new Image() )=> { IMG.src = link; $$.vars.DUMMY = IMG; },
    fetchImage : async link => {
              fetch(link).then( x=> x.blob() ).then( async xx=> $$.generateBlobForDummy(xx, 'blob') );
    },
    generateBlobForDummy : function(data, blob){
              let IMAGE = new Image();
              if(blob == 'blob')   IMAGE.src = URL.createObjectURL(data);
              else                 IMAGE.src = data;
              qu('.stamper').style.backgroundImage = `url(${IMAGE.src})`;
              $$.vars.DUMMY = IMAGE; //DUMMY
    },
    readGallery : async function(){
               fetch('./GALLERY/list.js').then( x=> (x.ok) ? x.json() : false).then( xx=> action(xx) );
               const action = (xx)=>{
                    let arr = Object.values(xx);
                    let view = qu('.gallery-view');
                        view.innerHTML = '';
                       for(let i = 0;i< arr.length;i++){
                           let div = dce('div');
                               div.classList.add('gallery-file');
                           let span = dce('span');
                               span.classList.add('gallery-file-name');
                           let downloadSpan = dce('span');
                               downloadSpan.innerText = '⬇︎';
                               downloadSpan.title = `DOWNLOAD ⬇︎`;
                               downloadSpan.classList.add('gallery-file-export');
                               span.innerText = arr[i];
                               div.setAttribute('name', arr[i] );
                               div.appendChild(span);
                               div.appendChild(downloadSpan);
                               downloadSpan.addEventListener('click', e=> $$.exportImage('./GALLERY/'+ downloadSpan.parentElement.getAttribute('name')) );
                           fetch('./GALLERY/'+ arr[i] ).then( x=> x.blob() ).then( async xx=> div.style.background = await `url(${URL.createObjectURL(xx)})` );
                           div.addEventListener('click', async e=> {
                               $$.fetchImage('./GALLERY/'+ arr[i]);
                               $$.vars.FILES['loaded']['name'] = arr[i]; //SAVE NAMES
                           });
                           view.appendChild(div);
                       }
                       $$.vars.FILES['gallery'] = arr; //SAVE NAMES
              }
              // let arr = $$.vars.RESPONSE.split(`\n`).filter( x=> (x != '') );
    },
    //READ UPLOADED FILE
    readUploadedFile : async function( from ){
              from.addEventListener('change', async e =>{
                   //ALL GOOD NOW CREATE NEW IMAGE ON SCREEN
                   let file = from.files[0];
                   let reader = new FileReader();

                   //CLEAR OLD DATA   //!!!IMPORTANT so another load wouldent duplicate data
                   from.parentElement.reset();
                   from.value = null;

                    //APPEND
                   reader.addEventListener('load', async e =>{
                     let _type= file.name;
                       switch(from){
                         case qu('#readFile'):
                                 if(file.type.search('image/') > -1) {
                                    await $$.generateBlobForDummy(reader.result);
                                          $$.vars.FILES['loaded'] = {}; //SAVE NAMES
                                          $$.vars.FILES['loaded']['name'] = file.name; //SAVE NAMES
                                          $$.vars.FILES['loaded']['data'] = reader.result; //SAVE NAMES
                                  }else if( file.type.search('text/') > -1){
                                     $$.vars.uploaded_TEXT = reader.result;
                                     qu('.text-to-paper').classList.add('filled');
                                  }
                         break;
                       }

                     from.value = ""; //CLEAN AFTER YOURSELF
                   });
                     //READ
                     if(file.type.search('image/') > -1)      reader.readAsDataURL(file);
                     else if(file.type.search('text/') > -1)  reader.readAsText(file);
               });
    },
    generateFileName : function(){
             let ln  = $$.vars.FILES.loaded.name;
             let arr = $$.vars.FILES.gallery;
             if(arr.includes(ln)) return ln;
             else                 return $$.randomName();
    },
    randomName : function(){
             let date = new Date();
             let time = date.toLocaleTimeString().split(':').join('_');
             let day = date.toDateString().split(' ').join('_');
             return 'paper_' + day+'_'+ time + '.png';
    },
    deleteMode : function(state){
           let gall = qu('.gallery-view');
           let children = gall.children;

           function on(){
               for(let i = 0; i<children.length;i++){
                   children[i].classList.add('wiggle');
                   let kill = dce('div');
                       kill.classList.add('kill-btn');
                       kill.innerText = 'x';
                      kill.addEventListener('click',e=>{
                        e.stopPropagation(); //DO NOT AFFECT PARENT
                        let name = e.target.parentElement.getAttribute('name');
                        if(e.target && name != null) {
                           $$.deleteFile( encodeURIComponent(name) ); //if malformed name with whitespaces in it, fix it
                           e.target.parentElement.remove();
                         }
                      });
                   children[i].appendChild(kill);
               }
           }
           function off(){
               for(let i = 0; i<children.length;i++){
                   children[i].classList.remove('wiggle');
                   children[i].querySelector('.kill-btn').remove();
               }
           }
             switch(state){
               case true  : on();  break;
               case false : off();  break;
             }
     },
     // EXPORT IMAGE
     exportImage : function(data){
            data = data || canvas.toDataURL("image/"+$$.vars.extension, 1.0);
            //INIT LINK AND URL OBJECT
            let a_link = dce('a');
                a_link.href = data;
            a_link.download = 'paper';
            a_link.hidden = true;
            a_link.id = 'linker';
            qu('.restovi').appendChild(a_link);
           //CLICK IT VIRTUALLY
           setTimeout( t=> qu('#linker').click(), 0.25 * 1000);
           //CLEAN AFTER YOURSELF
           setTimeout( t=> qu('#linker').remove() , 1.5 * 1000);
    },
    //# CREATE CANVAS quickly
    create_canvas : function(w, h, myID, father){
                       const c = dce('CANVAS');
                       c.width = w;  c.height = h;  c.id = myID;
                       father.appendChild(c);
    },
    findDataType : function(word){
                     let OV = Object.keys(MIME);
                     if(OV.includes('image/') > -1){
                        if(MIME['.'+word] != null) return MIME['.'+word];
                     }
    },
    exportAsSize :  function(){
            u_pick('Pick width/height/type ?', [
                   //VALUE - PLACEHOLDER -TITLE
                  [canvas.clientWidth, 'width', 'WIDTH'],
                  [canvas.clientHeight, 'height', 'HEIGHT'],
                  [$$.vars.extension, 'type', 'TYPE[ png, jpeg ...]']

           ], e=> {
                let EW = $$.vars.exportFile.width | 0;
                let EH = $$.vars.exportFile.height | 0;
                let T = $$.vars.exportFile.type;

                if(EW !=canvas.clientWidth || EH != canvas.clientHeight ||  T != $$.vars.extension){  //USER SET DIFFERENT EXPORTED SIZE
                    $$.create_canvas(EW, EH, "export-canvas", qu('.restovi') );
                    let exCanvas = qu("#export-canvas");
                        exCanvas.style.display = "none";
                        exCanvas.getContext('2d', {willReadFrequently: true,}).drawImage(canvas, 0, 0, EW, EH);

                        setTimeout( t=> {
                           let type = $$.findDataType($$.vars.exportFile.type || $$.vars.extension);
                           let data = exCanvas.toDataURL(type, 1.0);
                           $$.exportImage(data); //pass data and clean after yourself
                           setTimeout( t1=> exCanvas.remove(), 0.5 * 1000);
                         }, 0.6 * 1000);
                }else{
                  $$.exportImage(); //DEFAULT, DEFAULT SIZE + SAME TYPE, USER DID NOT CHANGE ANYTHING
                }
          });
    },
    rgbToHex : function(par){
                 let hex = Number(par).toString(16);
                 if(hex.length < 2) hex = '0' + hex;
                 return hex;
               },
    //# HEX TO RGB
    hexToRGB : function(hex){
                 let RGB = [];
                 for( let i=0; i < hex.length; i++) {
                      if(i % 2 == 1){
                         const splited = hex[i] + hex[i+1];
                         RGB.push(parseInt(splited, 16));
                    }
                 }
                 return RGB; //RETURNS ARRAY
               },
    //# FULL HEX
    fullHex : function(r, g ,b){
                  let R = $$.rgbToHex(r), G = $$.rgbToHex(g), B = $$.rgbToHex(b);
                  return '#'+ R + G + B;
               },
    // COLOR PICKER
    colorPicker : function(){
          let r =0, g=0, b=0,  box = qu('.color-picker'), boxCtx = box.getContext('2d', {willReadFrequently : true, alpha : false });
          let rect = 20;
          let frequency = 0.28, basix = 0;
              box.width = 200;
              box.height = 400;

          //# SPECIAL SMALL RECTANGLES
          const rectForPicker = function(x, y, w, h, color){
                                boxCtx.fillStyle = color;
                                boxCtx.fillRect(x, y, w, h);
                                boxCtx.strokeStyle = color;
                                boxCtx.strokeRect(x, y, w, h);
          }
          //DIFERENET COLOR VARIATIONS
          const colorSetupMode = function(i, ii){
                    r  = Math.sin(frequency*i + 1) * 127 + 128;
                    g  = Math.sin(frequency*ii + 2.2*Math.PI/3) * 127 + 128;
                    b  = Math.sin(frequency*i + 4.2*Math.PI/3) * 127 + 128;
          }

            //FILL COLORS
           for(let i = 0; i < box.height / rect; ++i){
             for(let ii = 0; ii < box.width / rect; ii++){
                 basix = Math.round(255 - (i * (rect -7) )) //BASIC COLORS
                 colorSetupMode(i , ii);

                 switch(ii){
                       default: rectForPicker( ii * rect, i * rect, rect, rect, `rgb(${255 - r-i }, ${255 - g-i }, ${255 - b-i })` );   break;
                       case 0:  rectForPicker( ii * rect, i * rect, rect, rect, `rgb(${basix }, ${ basix }, ${basix})` );               break;
                  }
                }
              }

            box.addEventListener( $$.vars.gestures[0] , e=>{
                  let clientRect = box.getClientRects();
                  let _cX , _cY; //HOLD tBOARD CORDINATES
                  let X = $$.mouseOrTouch(e , 'clientX') || $$.mouseOrTouch(e , 'pageX');
                  let Y = $$.mouseOrTouch(e , 'clientY') || $$.mouseOrTouch(e , 'pageY');

                    _cX = Math.round(X - clientRect[0].x);
                    _cY = Math.round(Y - clientRect[0].y);

                  let xc = boxCtx.getImageData(_cX, _cY, 1, 1).data;
                  $$.vars.color = $$.fullHex(...xc);
                  qu('.color').style.color = $$.vars.color;
            });
    },
    //# CLICK ON CANVAS AND GET COLOR --> COMPLEX AFTER CLICK ON [?] tile
    colorDetectMode : function(){
                 if($$.vars.COLOR_DETECTOR == false) return false;
                   const detect = (e)=>{
                         let clientRect = canvas.getClientRects();
                         let _cX=0 , _cY=0, xc=[];
                             let X = $$.mouseOrTouch(e , 'clientX') || $$.mouseOrTouch(e , 'pageX');
                             let Y = $$.mouseOrTouch(e , 'clientY') || $$.mouseOrTouch(e , 'pageY');
                             _cX = Math.round(X - clientRect[0].x);  // clientRect[0].right
                             _cY = Math.round(Y - clientRect[0].y);  // clientRect[0].top

                         xc = ctx.getImageData(_cX, _cY, 1, 1).data;
                         let detected = $$.fullHex(xc[0], xc[1], xc[2]);

                         $$.vars.color = detected;
                         qu('.color').style.color = $$.vars.color;
                         qu('.color-detect').classList.remove('running');

                         //CLEAN AFTER YOURSELF
                         $$.vars.COLOR_DETECTOR = false;
                         canvas.removeEventListener('click', detect );
                   }
                  canvas.addEventListener('click', detect );
                  qu('.color-detect').classList.add('running');
              },
    // RESIZE CANVAS TO SPACE AVAILABLE
    resizeToWindow : function(){
         let ph =  qu('.paper-holder');
         $$.query.paper.width  = ph.clientWidth;
         $$.query.paper.height = ph.clientHeight;
    },
    testSame : (A, B)=> (JSON.stringify(A) === JSON.stringify(B)) ? true : false,
    // SAVE IMAGE
    saveCanvasImage : function(e){
         $$.vars.savedImageData = ctx.getImageData(0,0, canvas.width, canvas.height);
         $$.vars.drawHistory.push( $$.vars.savedImageData);
         $$.vars.historyIndex = $$.vars.drawHistory.length-1;
         //OPTIMIZE HISTORY STORAGE to no more then 15 last versions
         if($$.vars.drawHistory.length > 15) $$.vars.drawHistory.shift(1);
    },
    // REMOVE LAST ITEM FROM ARRAY
    getPreviousVersion : function(redo){
         let i = $$.vars.historyIndex;
         (redo ) ? i += 1 : i -= 1;
         let dhl = $$.vars.drawHistory.length;
         ( i >= dhl) ? (i = dhl-1) : (i = Math.abs(i));
         (dhl > 0 && i < dhl && i > -1) ? ctx.putImageData($$.vars.drawHistory[ i ], 0, 0) : '';
         $$.vars.historyIndex = i;
    },
    // REDRAW CANVAS   pass exact index or use last image
    redrawCanvasImage : function(index){
          let lastImage = $$.vars.drawHistory[index || $$.vars.drawHistory.length-1];
          if(typeof lastImage != 'object') return false; //SAFE
              ctx.putImageData(lastImage, 0, 0 );
    },
    // CLEAR CANVAS
    clearCanvas : ()=> ctx.clearRect(0, 0, canvas.width, canvas.height),

    //manipulate loaded image
    manipulation : function(image, mode){
          if(image==null) return false;
          let tracker = qu('.tracker');

          const change = (that, mode)=> {
            let percW = that.width / 100, percH = that.height / 100;
            switch(mode){
              case '=':  that.width +=percW;  that.height +=percH;  break;   //= and + are on the same key
              case '-':  that.width -=percW;  that.height -=percH;  break;
              case '0':  that.width = that.naturalWidth; that.height = that.naturalHeight;  break;
            }
          }

          switch(image){
            // case $$.vars.cutImage:  change(image, mode);  break;  //get,put image[].data can be done little bit more complicated
            case $$.vars.DUMMY:     change(image, mode);  break;  //new Image()
          }
          //UPDATE TRACKER
          tracker.style.width  = image.width + 'px';
          tracker.style.height = image.height + 'px';
    },
    //FOLLOW ME TRACKER
    followMeTracker : function(e, perType){
        let tra = qu('.tracker'), size = $$.vars.draw_size;
        let trackerApply = (w, h)=>{
          let X = $$.mouseOrTouch(e , 'clientX') || $$.mouseOrTouch(e , 'pageX');
          let Y = $$.mouseOrTouch(e , 'clientY') || $$.mouseOrTouch(e , 'pageY');
              tra.style.left = X - w/2 +'px'
              tra.style.top  = Y - h/2 +'px';
              tra.style.width  = w + 'px';
              tra.style.height = h + 'px';
        }
        switch(perType){
          case 'stamper':  trackerApply( $$.vars.DUMMY.width,  $$.vars.DUMMY.height);  break;
          case 'eraser' :  trackerApply( size, size);  break;
          case 'text-to-paper':
          case 'select':
                    let shape = $$.vars.shape, mouse = $$.vars.mouse;
                    let sw = $$.vars.sidebarOffset;
                    let X = $$.mouseOrTouch(e , 'clientX') || $$.mouseOrTouch(e , 'pageX');
                    let Y = $$.mouseOrTouch(e , 'clientY') || $$.mouseOrTouch(e , 'pageY');
                    // let X = e.clientX, Y = e.clientY;

                    shape.width  = Math.abs(mouse.x - X + sw);
                    shape.height = Math.abs(mouse.y - Y);
                    (X > mouse.x) ? shape.x = mouse.x+sw : shape.x = X;
                    (Y > mouse.y) ? shape.y = mouse.y : shape.y = Y;

                    tra.style.left = shape.x +'px'
                    tra.style.top  = shape.y +'px';
                    tra.style.width  = shape.width + 'px';
                    tra.style.height = shape.height + 'px';
                    $$.setCors(shape.width, shape.height);
          break;
        }
        show_this( tra, 'block');
    },
    // SHOW CORDINATES OF SELECT BOX
    setCors : (x, y )=> qu('.cors').innerText = x +','+ y,
    correctShape : function(){
          if(qu('.tracker').style.display != 'none'){
             let shape =  $$.vars.shape;
             let sw = $$.vars.sidebarOffset;
             if(shape.width < 0) return [shape.x -sw, shape.y, Math.abs(shape.width) + 1, Math.abs(shape.height) + 1];
             else                return [shape.x -sw, shape.y, Math.abs(shape.width) + 1, Math.abs(shape.height) + 1];
          }
    },
    cutPaper : function(x, y, w, h, mode){
             if(qu('.tracker').style.display == 'none') return false;
             switch(mode){
               case 'cut':   $$.vars.cutImage = ctx.getImageData(x, y, w, h); ctx.clearRect(x,y,w,h); break;
               case 'copy':  $$.vars.cutImage = ctx.getImageData(x, y, w, h); break;
               case 'save':  $$.saveCut(ctx.getImageData(x, y, w, h));  break;
               default:      ctx.clearRect(x,y,w,h);       break; //DELETE
             }
    },
    saveCut : function(imageData){
             let dispo = dce('canvas'); dispo.width = imageData.width, dispo.height = imageData.height;
                 qu('.restovi').appendChild(dispo);
             let dtx = dispo.getContext('2d');
                 dtx.putImageData(imageData, 0, 0);
             let data = dispo.toDataURL('image/png', 1.0);
                 // $$.saveImageWithPhp(data);
              setTimeout( t=> dispo.remove(), 1* 1000);
    },
    preDesignSetup : function(){
             // let hp = HELP['pre-design'];
             let designs = {
                 "none" : 'none',
                 "lines": 'horizontal-lines-screen',
                 "sq"   : 'squares-screen',
                 "1/2"  : 'half-screen',
                 "1/3"  : 'tertile-screen',
                 "1/4"  : 'quarter-screen',
                 "3x3"  : 'three-by-three-screen',
                 "2x2"  : 'two-by-two-screen',
                 "word" : 'word-screen',
                 "cal"  : 'calendar-screen',
                 "dots" : 'dots-screen',
               };
             let Ok = Object.keys(designs), Ov = Object.values(designs);
             let holder = qu('.paper-holder');
             for(let i = 0;i< Ok.length;i++){
                  let btn = dce('button');
                      btn.classList.add('design-btn', 'btn');
                      btn.innerText = Ok[i];
                      btn.setAttribute('design', Ov[i]);
                      btn.addEventListener('click', e=>{
                        let des = btn.getAttribute( 'design' );
                        if(holder.classList[1] != null) holder.classList.remove( holder.classList[1] );
                          (des == 'none') ? '' : holder.classList.add(des);
                      });
                  qu('[ref="templates"]').nextSibling.getElementsByTagName('pre')[0].appendChild(btn);
             }
    },
    // DETERMINE SHOULD YOU USE MOUSE OR FINGER(TOUCH)
    mouseOrTouch : (e, what)=>{
          if($$.vars.gestures.includes('touchstart')){
             const touches = e.changedTouches[0];
                // log(touches);
                   e.preventDefault();
             return touches[what] - (touches['radiusX']/2);
          }else{
             return e[what];
         }
    },
    caliography : function(e, factor){
         //CALIOGRAPHY OPTION
         let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
         let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');
         const dX = X - $$.vars.mouse.x + (Math.random()* 10);
               dY = Y - $$.vars.mouse.y + (Math.random()* 10);
         let perpendicular = Math.atan2(dY, dX);
         return (perpendicular) * $$.vars.draw_size * (dX+dY) / 180 * factor; //Manipulate theese to get many different types of caliography
    },
    stylus : {
        start : (color="#000")=> { ctx.beginPath(); ctx.strokeStyle = color; },
        end   : (e)=>{
                 let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
                 let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');
                 ctx.moveTo($$.vars.mouse.x, $$.vars.mouse.y);
                 ctx.lineTo( X, Y);
                 ctx.stroke();
                 $$.vars.mouse.x = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
                 $$.vars.mouse.y = $$.mouseOrTouch(e , 'offseY') || $$.mouseOrTouch(e , 'pageY');
        }
    },
    grafitePencil : function(e, size, color, cali){
          $$.stylus.start(color);

          ctx.lineWidth   = (cali != null) ? $$.caliography(e, 0.5) : size;
          ctx.lineCap  = (cali != null) ? 'round' : 'butt';
          ctx.lineJoin = (cali != null) ? 'round' : 'miter';

          $$.stylus.end(e);
    },
    //PEN AND MARKER USE THE SAME THING
    pen : function(e, size, color, ordinary){
          $$.stylus.start(color);

          ctx.lineWidth = size;
          ctx.lineCap  = (ordinary != null) ? 'round' : 'butt';  //? pen : marker
          ctx.lineJoin = (ordinary != null) ? 'round' : 'miter';

          $$.stylus.end(e);
    },
    draw_text : function(it, text, x, y, color, textSize, e){
               it.font = `${textSize}px ${'Menlo'}`;
               it.fillStyle = color;
               let splited = qu('.smart_text').value.length;
               let offsetX = splited * (textSize / splited);
               (splited > 1 ) ? offsetX = offsetX : offsetX = 0;
               it.fillText(text, x - offsetX, y);
    },
    strokeOrFill : (path, color)=>{
          ctx.fillStyle = color;  ctx.strokeStyle = color;  ctx.lineWidth = $$.vars.draw_size;
          let max = qu('.point-control').max | 0;
          let size = $$.vars.draw_size;
              size == max ? ctx.lineWidth = 1 : ctx.lineWidth = size;
              size == max ? ctx.fill(path) : ctx.stroke(path);
    },
    drawRect        : (x, y, w, h, color)=> { let path = new Path2D(); path.rect(x, y, w, h);              $$.strokeOrFill(path, color);  },
    drawCircle      : (x, y, r, color   )=> { let path = new Path2D(); path.arc(x, y, r, 0, 2 * Math.PI);  $$.strokeOrFill(path, color);  },
    faded           : (ammount)=> `rgb(${[...$$.hexToRGB($$.vars.color)]}, ${ammount})`,
    cursorSvgUpdate : (size)=> doc.body.style.cursor = `url("images/circle(${size}x${size}).svg") ${size /2} ${size/2}, default`,
    composition     : (type)=> (type != null) ? ctx.globalCompositeOperation = type : ctx.globalCompositeOperation = "source-over",
    alpha           : (am)=>  (am != null) ? ctx.globalAlpha = am : ctx.globalAlpha = 1,
    // DRAW
    draw : function(e){
          if($$.vars.DRAWING == false) return false; //SAFE
          if($$.vars.COLOR_DETECTOR)   return false;  //TO DETECT COLOR TURN OFF DRAWING
          let size = $$.vars.draw_size, half = size /2, dummy = $$.vars.DUMMY || null;
          let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
          let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');

           switch($$.vars.type){
            case 'pencil':     $$.grafitePencil(e, $$.vars.draw_size, $$.vars.color, true);  break;
            case 'pen'   :     $$.pen(e, $$.vars.draw_size, $$.vars.color, true);            break;
            case 'marker':     $$.pen(e, 25, $$.faded(0.05) || '#0000000a' );                break;
            case 'crayon' :    $$.pen(e, $$.vars.draw_size, $$.faded(0.1) || '#0000000a' );  break;
            case 'line'  :     $$.stylus.start($$.vars.color); ctx.lineWidth = size;         break;
            case 'eraser':     $$.composition("destination-out");  $$.pen(e, $$.vars.draw_size, $$.vars.color, true);    break;                //ctx.clearRect(e.offsetX - half, e.offsetY -half, size, size); break;
            case 'smart_text': $$.draw_text(ctx, $$.vars.STT, Math.floor(X - half), Math.floor(Y + half), $$.vars.color, size*2, e);  break;   //keep it in middle
            case 'stamper':    if(dummy) ctx.drawImage(dummy, Math.floor(X - dummy.width/2), Math.floor(Y - dummy.height/2),  dummy.width, dummy.height); break;
          }
    },
    onMobile  : ()=> (window.matchMedia("only screen and (max-width: 760px)").matches && navigator.userAgent.search(/mobile|iPhone|Android|iPad/) > -1 ) ? true : false,


}

const main = function(){
    $$.collectQuery();
    if($$.onMobile() == false){
       $$.vars.gestures = ['mousedown','mousemove','mouseup', 'mouseout'];
    }else{
       $$.vars.gestures = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
    }
    window.canvas = $$.query.paper;
    window.ctx = $$.query.paper.getContext('2d',  {willReadFrequently: true} );
    // SIDEBAR INPUTS ACTIONS
    $$.query.sidebar.addEventListener( $$.vars.gestures[0], e=>{
            let className = e.target.classList[0] || null;
            let activate = (e) => { $$.stripClass(quAll('.sidebar>.clicker'), 'active' ),
                                    e.classList.add('active'),
                                    $$.updateToolSize($$.vars.type );
                                  };
             switch(className){
                 case 'power':    location.reload();       break;
                 case 'new':      qu('#readFile').click(); break;
                 case 'undo':     $$.clearCanvas(); $$.getPreviousVersion(); break;
                 case 'redo':     $$.clearCanvas(); $$.getPreviousVersion('redo');  break;
                 // case 'save':     if($$.isCanvasEmpty(ctx) == 'not-empty') $$.saveImageWithPhp();  break;
                 case 'export':   $$.exportAsSize();      break;
                 case 'gallery':  $$.openGallery();       break;

                 case 'pen':     case 'pencil':  case 'marker': case 'text-to-paper': case 'select': case 'stamper':
                 case 'eraser':  case 'crayon':  $$.vars.type = className;  activate(e.target);   break;
                 case 'line'  :    $$.vars.type = className;  activate(e.target);   break;

                 case 'smart_text':  $$.vars.type = className;  activate(e.target.parentElement);   break;
                 case 'color' :      $$.openPicker();                                 break;
                 case 'color-detect':
                                  (!$$.vars.COLOR_DETECTOR) ? $$.vars.COLOR_DETECTOR = true : '';
                                  $$.colorDetectMode();
                 break;
                 case  'help':    $$.openHelp();  break;
                 case  'trash':   $$.clearCanvas(); $$.vars.FILES.loaded = {};  $$.saveCanvasImage(e); break;    //SAVE ONE EMPTY CLEARED SCREEN FOR LINE
             }

              if($$.vars.type != 'eraser') $$.composition(null);
              ($$.vars.type == 'crayon') ? $$.alpha(0.03900) : $$.alpha(null);   //0.03849  fadest
    });
    // GALLERY CONTROL START DELETE MODE
    qu('.gallery-control').addEventListener( $$.vars.gestures[0] , e=>{
        let className = e.target.classList[0] || null;
        switch(className){
          case 'delete-mode':
                let one = qu('.kill-btn');
                   (one == null) ? $$.deleteMode(true) : $$.deleteMode(false);
          break;
        }
    });
    // CONTROL SIZE OF POINTER
    qu('.point-control').addEventListener('change', e=>{
          $$.vars.draw_size = e.target.value | 0;
          e.target.title = "POINT CONTROL :" +$$.vars.draw_size;
          if($$.vars.draw_size > 23)      $$.cursorSvgUpdate(23);
          else if($$.vars.draw_size < 11) $$.cursorSvgUpdate(11);
          else                            $$.cursorSvgUpdate($$.vars.draw_size);

          $$.updateToolSize($$.vars.type, e.target.value);
    });
    //SMART TEXT UPADTE
    qu('.smart_text').addEventListener('input', e=> $$.vars.STT = e.target.value );
    // MOUSEDOWN
    $$.query.paper.addEventListener( $$.vars.gestures[0], e =>{   //mousedown || touchstart
          let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
          let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');
          $$.vars.mouse.x = X;
          $$.vars.mouse.y = Y;
          $$.vars.DRAWING = true;

          // SPECIAL CASSES to work on light touching of trackpad/screen
          switch($$.vars.type){
                case 'line':   $$.draw(e);  $$.saveCanvasImage(e);         break;
                case 'select' : show_this(qu('.tracker'), 'none');         break;
                case 'stamper': case 'pen': case 'smart_text': case 'eraser':
                          $$.draw(e);
                break;
          }
    });
    //HIDE ALL WHEN OUTSIDE
    $$.query.paper.addEventListener( $$.vars.gestures[3] , e=> show_this(qu('.tracker'), 'none') );
    //MOUSEMOVE
    $$.query.paper.addEventListener( $$.vars.gestures[1], e =>{   //mousemove || touchmove
        if($$.vars.DRAWING) $$.draw(e);

        let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
        let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');

        switch($$.vars.type){
           case 'line':
                 ctx.moveTo( $$.vars.mouse.x, $$.vars.mouse.y);
                 ctx.lineTo( X, Y);
               if($$.vars.DRAWING){
                  $$.clearCanvas();
                  $$.redrawCanvasImage();  //$$.vars.historyIndex
                  ctx.stroke();
                }
            break;
            case 'stamper':       if($$.vars.DUMMY)  $$.followMeTracker(e, $$.vars.type); break;
            case 'text-to-paper': if($$.vars.DRAWING && $$.vars.uploaded_TEXT.length > 0) $$.followMeTracker(e, $$.vars.type); break;
            case 'select':        if($$.vars.DRAWING) $$.followMeTracker(e, $$.vars.type); break;
        }
    });
    // MOUSEUP
    $$.query.paper.addEventListener( $$.vars.gestures[2], e =>{  //mouseup || touchend
        $$.vars.DRAWING = false;
        let X = $$.mouseOrTouch(e , 'offsetX') || $$.mouseOrTouch(e , 'pageX');
        let Y = $$.mouseOrTouch(e , 'offsetY') || $$.mouseOrTouch(e , 'pageY');
        $$.vars.shape.width  = X - $$.vars.mouse.x;
        $$.vars.shape.height = Y - $$.vars.mouse.y;
        let Shape = $$.vars.shape;
        let save  = $$.query.save;

        switch($$.vars.type){
            case 'line':  ctx.stroke();  ctx.closePath(); break;
            case 'stamper': case 'eraser':  show_this(qu('.tracker'), 'none'); break;
            case 'text-to-paper':
                  draw_multiline_text(ctx, $$.vars.uploaded_TEXT, Shape.x, Shape.y , $$.vars.color, $$.vars.draw_size, Shape.width || canvas.clientWidth);
                  show_this(qu('.tracker'), 'none');
            break;
       }
       let weSaved = ['line'];
       if( weSaved.includes($$.vars.type) == false) $$.saveCanvasImage(e); //AUTO SAVE IMAGE
       // if(save.classList.contains('disabled') ) save.classList.remove('disabled'); //ENABLE SAVE
    });
   // RESIZE
   window.addEventListener('resize', e=>{
        $$.resizeToWindow();
        $$.redrawCanvasImage();
   });
   // ON DOM LOADED
   window.addEventListener('DOMContentLoaded', e=>{
        $$.resizeToWindow();
        $$.fillHelp();
        $$.preDesignSetup();
        style_set('--date', JSON.stringify(new Date().toLocaleDateString()) );
   });
   window.addEventListener('keydown', e=>{
        let Shape;
        switch(e.key){
          case '=':  case '-': case '0':   Shape =$$.correctShape();  if(Shape && Shape.length > 1 ) $$.manipulation($$.vars.DUMMY, e.key);  break;
          case 'v':          Shape =$$.correctShape();  if(Shape && Shape.length > 1 && $$.vars.cutImage ) ctx.putImageData($$.vars.cutImage, Shape[0], Shape[1] );      break;  //PASTE
          case 'x':          Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.cutPaper(...Shape, 'cut');   break;
          case 'c':          Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.cutPaper(...Shape, 'copy');  break;
          case 's':          Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.cutPaper(...Shape, 'save'); addAnimation(qu('#paper'), 0.5);  break;
          case 'Backspace':  Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.cutPaper(...Shape);          break;
          case ' ':          Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.drawRect(...Shape, $$.vars.color);  break;
          case 'o':          Shape =$$.correctShape();  if(Shape && Shape.length > 1) $$.drawCircle(Shape[0] + Shape[2]/2, Shape[1] + Shape[2]/2, Shape[2]/2, $$.vars.color);  break;
        }
   });
   // SET ON START
   $$.colorPicker(); //START COLOR PICKER with color pallete
   $$.readUploadedFile(qu('#readFile'));
}

main();
