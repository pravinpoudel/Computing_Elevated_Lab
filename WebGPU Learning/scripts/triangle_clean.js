(async  function(){
    console.log(navigator.gpu);
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    if(!device){
        return gotToFallback();
    }

    const canvas = document.getElementById("main-screen");
    const context = canvas.getContext("webgpu");
    console.log(context)

    // 2-d position of a vertex -----------------------------------
    let vertexBuffer = device.createBuffer({
        size: 3*2*4,
        usage: GPUBufferUsage.VERTEX ,
        mappedAtCreation: true
    });

    let mappingVertexArray = new Float32Array(vertexBuffer.getMappedRange());
    mappingVertexArray.set([1.0, 0.0, 0.0, 1.0, -1.0, -1.0]);
    vertexBuffer.unmap();

    //color of a vertex --------------------------------------

    let colorBuffer = device.createBuffer({
        size:3*4*4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });

    let mappingColorArray = new Float32Array(colorBuffer.getMappedRange());
    mappingColorArray.set([
        0.8, 0.0, 0.0, 1.0,
        0.0, 0.8, 0.0, 1.0,
        0.0, 0.0, 0.8, 1.0,
    ]);
    colorBuffer.unmap();

    const shaderModuleVertex = device.createShaderModule({code: V_S_triangle});
    const shaderModuleFragment = device.createShaderModule({code: F_S_triangle});

    const triangleRenderPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({bindGroupLayouts:[]}),
        vertex:{
            module: shaderModuleVertex,
            entryPoint:"vs_mainT",
            buffers:[{
                arrayStride:2*4,
                attributes:[
                    {format: "float32x2", offset: 0, shaderLocation:0 }
                ]
            },
            {
                arrayStride: 4*4,
                attributes:[
                    {format: "float32x4", offset: 0, shaderLocation: 1}
                ]
            }]
        },

        fragment:{
            module: shaderModuleFragment,
            entryPoint: "fs_mainT",
            targets: [{
                format: "bgra8unorm"
            }]
        },

        primitive: { topology:"line-strip"},
        depthStensil: {
            format: "depth24plus-stencil8",
            depthWriteEnabled: true,
            depthCompare: "less" 
         }
    });
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [ 900, 600
        // canvas.clientWidth * devicePixelRatio,
        // canvas.clientHeight * devicePixelRatio,
      ];

    context.configure({
        device: device,
        format: context.getPreferredFormat(adapter),
        compositingMode: "premultiplied",
        size: presentationSize,
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });


    const depthTexture = device.createTexture({
        size: [canvas.clientWidth, canvas.clientHeight, 1],
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const renderPassDescriptor = {
        colorAttachments: [{
            view: null,
            clearValue: [1.0, 1.0, 1.0, 1.0],
            loadOp: 'clear',
            storeOp: 'discard'
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthStoreOp: "store",
            depthLoadOp: "clear",
            stencilStoreOp:"store",
            stencilLoadValue: 0
        },
    }
    

    function frame(){
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
        const textureWidth = 900;
        const textureHeight = 600;        
        const readBuffer = device.createBuffer({
            size: textureWidth*textureHeight*4,
            usage: GPUBufferUsage.MAP_READ| GPUBufferUsage.COPY_DST
        });

        let commandEncoder = device.createCommandEncoder();
        let renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
        renderPass.setPipeline(triangleRenderPipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setVertexBuffer(1, colorBuffer);
        renderPass.draw(3, 1, 0, 0);
        renderPass.endPass();
        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);


})()
