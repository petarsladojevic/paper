const HELP={
  "About" : "Hello stranger, my name is PAPER. I've been created, to make notes, by drawing, fast, versatile and easy",
  "⏻"     : "Power",
  "+"     : "Upload image file",
  "fs"    : "File Save (to GALLERY)",
  "⮐"    : "Undo last draw",
  "⮑"    : "Redo last undo",
  "⛏"     : "Export as: [width/height/type] OR use default",
  "⎕⎕"    : "Gallery holds all papers, you created",
  "✐"     : "Pencil",
  "m"     : "Marker is fixed size and lighter color shade",
  "c"     : "Crayon add's light shades",
  "🆃"    : "Uploaded text can be put onto paper, select box from where and width to wrap around",
  "⛶"     : `
<pre>
Select box creates selection of paper:

Select box commands after selection:
⌫     : Delete
space : draw <span class='large'>◻︎</span>
o     : draw <span class='large'>◯</span>
x     : Cut (copy+delete)
c     : Copy
v     : Paste
s     : Save cut to Gallery
</pre>
  `,
  "⏊"     :  `<pre>
Stamper stamps, or draw\'s with uploaded image
Commands:
0     : Revert to natural size
-     : Diminish image size
+/=   : Enlarge image size
</pre>`,
  "//" : "Smart text allows user to pick any character as pointer in draw",
  "▊"    : "Eraser",
  "⟶"   : "Line",
  "●"    : "Color palete of rainbow colors + black/white spectar",
  "⚑"    : "Color picker detect's any color from canvas (good for uploaded image color detecting)",
  "♺"    : "Recycle design",
  "?"    : "Help",
  "point-control" : `・・・・・・<span class="large">●</span>・・        (0-max) = stroke, max = fill shape`,
  "<span style='color:var(--bluish)'>.</span>" : "Data inside...",
  "Keyboard" : `
<pre>
          KEYBOARD shortcuts
          ________________________________
          ESC . . . . . . . . . . . .  POW
          ± 1 2 3 4 5 6 7 8 9 <span class="bitno">0 - + DELETE</span>
          TAB q w e r t y u i <span class="bitno">o</span> p [ ]   EE
          ===  a <span class="bitno">s</span> d f g h j k l ; ' \\
          == ~ z <span class="bitno">x c v </span> b n m , . /   SHIFT
          = ^ ⌥ ⌘ <span class="bitno">▬▬▬▬▬▬▬▬▬▬▬</span> ⌘ ⌥    ◀︎ ▲ ▶︎
</pre>
              `,
  "templates": `<pre></pre>`

}


const MIME = {
    ".aac"  : "audio/aac",
    ".abw"	: "application/x-abiword",
    ".arc"	: "application/x-freearc",
    ".avi"	: "video/x-msvideo",
    ".azw"	: "application/vnd.amazon.ebook",
    ".bin"	: "application/octet-stream",
    ".bmp"	: "image/bmp",
    ".bz"	  : "application/x-bzip",
    ".bz2"	: "application/x-bzip2",
    ".cda"	: "application/x-cdf",
    ".csh"	: "application/x-csh",
    ".css"	: "text/css",
    ".csv"	: "text/csv",
    ".doc"	: "application/msword",
    ".docx"	: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".eot"	: "application/vnd.ms-fontobject",
    ".epub"	: "application/epub+zip",
    ".gz"   : "application/gzip",
    ".gif"	: "image/gif",
    ".html" :	"text/html",
    ".ico"	: "image/vnd.microsoft.icon",
    ".ics"	: "text/calendar",
    ".jar"	: "application/java-archive",
    ".jpeg" : "image/jpeg",
    ".jpg"	: "image/jpeg",
    ".js"		: "text/javascript",
    ".json"	  : "application/json",
    ".jsonld"	: "application/ld+json",
    ".midi"	 : "audio/midi audio/x-midi",
    ".mjs"	 : "text/javascript",
    ".mp3"	 : "audio/mpeg",
    ".mp4"	 : "video/mp4",
    ".m4a"	 : "audio/x-mp4", //NON-REGULAR FORMAT, but it is included since mac os
    ".mpeg"	 : "video/mpeg",
    ".mpkg"	 : "application/vnd.apple.installer+xml",
    ".odp"	 : "application/vnd.oasis.opendocument.presentation",
    ".ods"	 : "application/vnd.oasis.opendocument.spreadsheet",
    ".odt"	 : "application/vnd.oasis.opendocument.text",
    ".oga"	 : "audio/ogg",
    ".ogv"	 : "video/ogg",
    ".ogx"	 : "application/ogg",
    ".opus"	 : "audio/opus",
    ".otf"	 : "font/otf",
    ".png"	 : "image/png",
    ".pdf"   : "application/pdf",
    ".php"	 : "application/x-httpd-php",
    ".ppt"	 : "application/vnd.ms-powerpoint",
    ".pptx"	 : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar"	 : "application/vnd.rar",
    ".rtf"	 : "application/rtf",
    ".sh"    : "application/x-sh",
    ".svg"	 : "image/svg+xml",
    ".swf"	 : "application/x-shockwave-flash",
    ".tar"	 : "application/x-tar",
    ".tiff"	 : "image/tiff",
    ".ts"	   : "video/mp2t",
    ".ttf"	 : "font/ttf",
    ".txt"	 : "text/plain",
    ".vsd"	 : "application/vnd.visio",
    ".wav"   : "audio/wav",
    ".weba"  : "audio/webm",
    ".webm"  : "video/webm",
    ".webp"	 : "image/webp",
    ".woff"  : "font/woff",
    ".woff2" : "font/woff2",
    ".xhtml" : "application/xhtml+xml",
    ".xls"	: "application/vnd.ms-excel",
    ".xlsx"	: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml"  : "application/xml",
    ".xul"  : "application/vnd.mozilla.xul+xml",
    ".zip"  : "ZIP archive	application/zip",
    ".3gp"  : "video/3gpp",
    ".3g2"  : "video/3gpp2",
    ".7z"	  : "application/x-7z-compressed"
}
