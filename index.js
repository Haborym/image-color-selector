window.onload = function() {
    console.log('hello');

    let threshold = 20;
    let algorithmFn = 'deltaE76';

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
        base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/FBK4zna8FL4fmki4t.jpg';
        // base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/96cNmdZ8c8KCuSA8n.jpg';
        // base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/qWoaX85ntnzhK55Cj.jpg';
        base_image.onload = function(){
            height = base_image.height;
            width = base_image.width;
            context.drawImage(
                base_image, 0, 0, base_image.width, base_image.height,
                0, 0, canvas.width - 200, canvas.height
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
        
        const color_ref = rgb2lab(data_p);
        console.log(color_ref);

        const startEvent = new Date();
        const image = context.getImageData(0, 0, width, height);
            
        processPixels(image, color_ref);

        const endEvent = new Date();
        const secondsDelta = (endEvent.getTime() - startEvent.getTime()) / 1000;

        console.log(`Opération résolue en ${secondsDelta} secondes !`);
    });

    document.getElementById('threshold').addEventListener('change', event => {
        document.getElementById('span_value').textContent = event.target.value;

        threshold = event.target.value;
    });

    document.getElementById('algo-select').addEventListener('change', event => {
        algorithmFn = event.target.value;
    });
    
    function processPixels(image, color_ref) {
        const { data } = image;
        const { length } = data;

        let percent = 0;
        let pixel_target;

        for (let i = 0; i < length; i += 4) { // red, green, blue, and alpha
            pixel_target = rgb2lab([data[i], data[i+1], data[i+2]]);
            const calculus = Math.round((i/length)*100);
            if(percent !== calculus) {
                percent = calculus;
                console.log(`${percent}`);
            }

            const deltaEValue = window[algorithmFn](color_ref, pixel_target);
            // const deltaEValue = deltaE76(color_ref, pixel_target);
            // const deltaEValue = deltaE94(color_ref, pixel_target);

            if(deltaEValue > threshold) {
                const greyscale = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2]; 

                data[i + 0] = greyscale;
                data[i + 1] = greyscale;
                data[i + 2] = greyscale;                    
            }
        }

        context.putImageData(image, 0, 0);
    }
}

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

/**
 * Compute the DeltaE of the CIE76 formula
 * 
 * @param {object} x1 (L*1, a*1, b*1)
 * @param {object} x2 (L*2, a*2, b*2)
 * @returns number
 */
function deltaE76(x1, x2) {
    return Math.sqrt(
        Math.pow(x2.L - x1.L, 2) +
        Math.pow(x2.A - x1.A, 2) +
        Math.pow(x2.B - x1.B, 2)
    );
}

/**
 * Compute the DeltaE of the CIE94 formula
 * 
 * @param {object} x1 (L*1, a*1, b*1)
 * @param {object} x2 (L*2, a*2, b*2)
 * @param {boolean} defaultParam if true graphic art mode else textile mode
 * @returns number
 */
function deltaE94(x1, x2, defaultParams = true) {
    //consts
    const Kl = defaultParams ? 1 : 2;
    const K1 = defaultParams ? 0.045 : 0.048;
    const K2 = defaultParams ? 0.015 : 0.014;
    const Kc = 1;   // TBD
    const Kh = 1;   // TBD

    const deltaLStar = x1.L - x2.L;

    const C1Star = Math.sqrt(
        Math.pow(x1.a, 2) + Math.pow(x1.b, 2)
    );

    const C2Star = Math.sqrt(
        Math.pow(x2.a, 2) + Math.pow(x2.b, 2)
    );

    const Sl = 1;   // Defined
    const Sc = 1 + (K1 * C1Star);
    const Sh = 1 + (K2 * C1Star);

    const deltaCabStar = C1Star - C2Star;

    const deltaAStar = x1.a - x2.a;
    const deltaBStar = x1.b - x2.b;

    const deltaHabStar = Math.sqrt(
        Math.pow(deltaAStar, 2) + Math.pow(deltaBStar, 2) + Math.pow(deltaCabStar, 2)
    );

    return Math.sqrt(
        Math.pow(
            (deltaLStar / (Kl * Sl))
            , 2),
        Math.pow(
            (deltaCabStar / (Kc * Sc))
            , 2),
        Math.pow(
            (deltaHabStar / (Kh * Sh))
            , 2),
    );
}