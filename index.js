window.onload = function() {
    console.log('hello');

    let first = true;
    let xBase = {};

    let canvas = document.getElementById('testCouleur');
    let context = canvas.getContext('2d');

    let arr_data = null;

    make_base();

    function make_base() { 
        base_image = new Image();
        base_image.crossOrigin = "anonymous";
        base_image.src = 'https://socialboulder.s3-eu-west-1.amazonaws.com/bouldersPics/vMb6jjcfe7arsqoLq.jpg';
        // base_image.src = 'route.jpg';
        base_image.onload = function(){
            context.drawImage(
                base_image, 0, 0, base_image.width, base_image.height,     // source rectangle
                0, 0, canvas.width, canvas.height
            );

            arr_data = context.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    canvas.addEventListener('click', event => {
        // console.log(event);
        
        const pixel = context.getImageData(event.x, event.y, 1, 1);
        const data_p = pixel.data;

        console.log(`r: ${data_p[0]}, g: ${data_p[1]}, b: ${data_p[2]}`);
        
        const temp_x = rgb2lab(data_p);
        console.log(temp_x);
        if(first) {
            first = false;
            xBase = temp_x;
        } else {
            console.log(deltaE(xBase, temp_x));
        }        
    });

    
    function rgb2lab(rgb){
        var r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
            x, y, z;
    
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

    function deltaE(x1, x2) {
        return Math.sqrt(
            Math.pow(x2.L - x1.L, 2) +
            Math.pow(x2.A - x1.A, 2) +
            Math.pow(x2.B - x1.B, 2)
        );
    }
}

