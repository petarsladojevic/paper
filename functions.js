//FUNC.
const u_pick = function(question, defaults=[],  action ){
  if(document.getElementById("u_pick_box")!= null) return false;  //ONLY ONE BOX AT THE TIME
  let div, final = {};
    function init_choice(){
      div = document.createElement('div');
      div.id ="u_pick_box";

      div.style.width = 250 + 'px';      div.style.height = 150 + 'px';
      div.style.position = 'absolute';   div.style.display = 'grid';
      div.style.left = 35 + '%';         div.style.padding = 3 + '%';
      div.style.top = 20 + '%';          div.style.boxShadow = `1px 1px 6px black`;
      div.style.borderRadius = 3 + 'px';

       //EVALUATE QUESTION AS STRING
     if(typeof question == 'string')  div.innerHTML = question;  //ACCEPTS FORMATING OF QUESTION
     else  return false;

     let elems = [];

     //DEFAULTS are passsed as  [value, placeholder, title];
     for(let i = 0;i< defaults.length;i++){
          elems[i] = document.createElement('input');
          elems[i].type = 'text';
          elems[i].value = defaults[i][0] || '/';
          elems[i].placeholder = defaults[i][1] || '/';
          elems[i].title = defaults[i][2] || '/';
          final[elems[i].placeholder] = elems[i].value;
          elems[i].addEventListener('input', e=>{
            final[elems[i].placeholder] =  e.target.value;
            $$.vars.exportFile = final;
          })
          if(i == 0) elems[i].id = "A";
          div.appendChild(elems[i]);
      }
      let yes = document.createElement('button');
      let no = document.createElement('button');

      yes.innerText = 'yes';
      no.innerText = 'cancel';

      yes.value = 'yes';
      no.value = 'no';

      document.body.appendChild(div);
      div.appendChild(yes);
      div.appendChild(no);
      document.getElementById('A').focus();
    }
    init_choice(); //CALLED IMIDIATLY

    //LISTENING FOR ANSWER
    div.addEventListener('click', async function(e){
          if(e.srcElement.value == "yes")  {
             await e;
             div.remove();
             return action();
           }else if(e.srcElement.value == "no"){
             div.remove();
             return false;
          }
       });
}
// TITLER
const titlerAt = (x, y, content)=>{
      let T = qu('.titler');
          T.style.left = x +'px';
          T.style.top  = y +'px';
          T.innerText  = content;
          T.style.display = 'block';
          // setTimeout( t=> T.style.display = 'none', 3* 1000);
}
const draw_multiline_text = (it, text, x, y, color, size, maxWidth)=>{
      let factor = 0.66;  //multiple by factor of size vs char (to get rough aproximaate value)
      let charsPerLine = parseInt(Math.abs(maxWidth) / (size * factor));
      let totalLines = Math.ceil(text.length / charsPerLine);

      let line = ``, line_index = 0;
      for(let i = 0; i< text.length;i++){
          line += text[i];
          if(i % charsPerLine == 0 && i > 0){
             $$.draw_text(it, line , x, y + (size) * line_index , color, size);
             line = ``;
             line_index +=1;
          }
          if(line_index == totalLines-1 && i == text.length-1)  $$.draw_text(it, line , x, y + (size) * line_index , color, size);    //LAST LINE
      }
}
const encodeSvg =(svg_str)=>{
      return "data:image/svg+xml," + encodeURIComponent(svg_str);
}
const calcAngleDegrees = function(x, y) {
      //CALCULATE ANGLE IN DEGREES
      return Math.atan2(y, x) * 180 / Math.PI;
}
const addAnimation =(el, time)=>{
      el.style.animation = "iphoneDelete " + time + 's';
      setTimeout( t=>el.style.animation = '', time * 3 * 1000);
}
// Create a function for getting a variable value
function style_get(property) {
      const r = document.querySelector(':root');
      const style = getComputedStyle(r);
            style.getPropertyValue(property);
}
// Create a function for setting a variable value
function style_set(now, next) {
      const r = document.querySelector(':root');
            r.style.setProperty(now, next);
}
