const w = new WebSocket('ws://localhost:3333');

// w.onopen = () => {
//     w.send('hello');
// };

w.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    const actions = {
        added: (b) => {
            console.dir({ b });

            const img = document.createElement('div');
            img.style.cssText = `background-image:url("${b.img}");`;
            img.classList.add('container');
            document.body.appendChild(img);
//             $("<div/>", {
//     class: 'container',
//     style: {''http://www.example.com/',
//     text: 'Example Page'
// }).appendTo("body");
        }
    };
    const res = actions[data.head](data.body);
    if (res) w.send(res);
};


/*
d8888b. d8888b.  .d8b.   d888b  
88  `8D 88  `8D d8' `8b 88' Y8b 
88   88 88oobY' 88ooo88 88      
88   88 88`8b   88~~~88 88  ooo 
88  .8D 88 `88. 88   88 88. ~8~ 
Y8888D' 88   YD YP   YP  Y888P 
*/


function allowDrop(ev) {
    ev.preventDefault();
}

// function drag(ev) {
//     ev.dataTransfer.setData('text', ev.target.id);
// }

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    console.log(data);
    if (w.readyState !== w.OPEN) {
        console.log(`WSC state:${w.readyState}`);
        return;
    }

    w.send(JSON.stringify({ head: 'add', body: data }));
}
