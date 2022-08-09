window.onload = function() {
    console.log('hello');

    let first = true;
    let xBase = {};

    let canvas = document.getElementById('testCouleur');
    let context = canvas.getContext('2d');

    let height = -1;
    let width = -1;

    let arr_data = null;

    make_base();

    function make_base() { 
        base_image = new Image();
        base_image.crossOrigin = "anonymous";
        // base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/vMb6jjcfe7arsqoLq.jpg';
        // base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/FBK4zna8FL4fmki4t.jpg';
        base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/96cNmdZ8c8KCuSA8n.jpg';
        base_image.onload = function(){
            height = base_image.height;
            width = base_image.width;
            context.drawImage(
                base_image, 0, 0, base_image.width, base_image.height,     // source rectangle
                0, 0, canvas.width - 200, canvas.height
                // 0, 0, canvas.width - 200, canvas.height
            );

            arr_data = context.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    canvas.addEventListener('mousemove', event => {
        const pixel = context.getImageData(event.x, event.y, 1, 1);
        const data_p = pixel.data;
        context.fillStyle = `rgb(${data_p[0]}, ${data_p[1]}, ${data_p[2]})`
        context.fillRect(canvas.width - 200, 0, 150, 150);
    });

    canvas.addEventListener('click', event => {
        console.log(`x:${event.x}, y:${event.y}`);
        
        const pixel = context.getImageData(event.x, event.y, 1, 1);
        const data_p = pixel.data;

        console.log(`r: ${data_p[0]}, g: ${data_p[1]}, b: ${data_p[2]}`);
        
        const temp_x = rgb2lab(data_p);
        console.log(temp_x);
        if(first) {
            first = false;
            xBase = temp_x;
            // context.fillStyle = `rgb(${data_p[0]}, ${data_p[1]}, ${data_p[2]})`
            // context.fillRect(canvas.width - 200, 0, 150, 150);
        }
        const startEvent = new Date();
        const image = context.getImageData(0, 0, width, height);
        const { data } = image;
        const { length } = data;
            
        let percent = 0;

        for (let i = 0; i < length; i += 4) { // red, green, blue, and alpha
            pixel_target = rgb2lab([data[i], data[i+1], data[i+2]]);
            const calculus = Math.round((i/length)*100);
            if(percent !== calculus) {
                percent = calculus;
                console.log(`${percent}`);
            }

            const deltaEValue = deltaE(xBase, pixel_target);

            if(deltaEValue > 45) {
                const greyscale = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2]; 

                data[i + 0] = greyscale;
                data[i + 1] = greyscale;
                data[i + 2] = greyscale;                    
            }
        }
            
        context.putImageData(image, 0, 0);
        const endEvent = new Date();
        const secondsDelta = (endEvent.getTime() - startEvent.getTime()) / 1000;

        console.log(`Opération résolue en ${secondsDelta} secondes !`);
    });

    
    function rgb2lab(rgb){
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        let x, y, z;
    
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    
        x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    
        return {
            L: (116 * y) - 16,
            A: 500 * (x - y),
            B: 200 * (y - z)
        }
    }

    // CIE76 way
    function deltaE(x1, x2) {
        return Math.sqrt(
            Math.pow(x2.L - x1.L, 2) +
            Math.pow(x2.A - x1.A, 2) +
            Math.pow(x2.B - x1.B, 2)
        );
    }
}

