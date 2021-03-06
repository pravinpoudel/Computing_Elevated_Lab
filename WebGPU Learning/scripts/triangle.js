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

    //----------------------------------------------------------------------

    //we only need one depth image because there is only one draw operation running at once
    //depth image should have same resolution as color attachment
    //so what should be the right format for depth image? The format must contain a depth component

    //VULKAN-------------------------------------------------
    // WE DONT NEED ANY SPECIFIC FORMAT OF TEXTURE BECAUSE WE WONT BE ACCESSING THE
    // TEXTURE. IT JUST NEEDS TO HAVE REASONABLE ACCURACY AT LEAST 24 BIT
    // IS COMMON IN REAL WORLD APPLICATION. IT CAN BE ANY FORMAT LIKE 32 BIT FOR DEPTH, 24 (DEPTH) + 8 (STENCIL)
    //---------------------------------------------------------------------------------------------------

    //we would chose 32 bit depth because it is most supported in hardware

    const shaderModuleVertex = device.createShaderModule({code: V_S_triangle});
    const shaderModuleFragment = device.createShaderModule({code: F_S_triangle});

    //GpuPipelineLayout defines the mapping between resources of all GPUBindGroup objects 
    //setup dduring command encoding in setBindGroup and setPipeLine

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
                format: "bgra8unorm" // i am going blend with defaut value but will try other too further
            }]
        },

        primitive: { topology:"line-strip"},
        depthStensil: {
            format: "depth24plus-stencil8",
            depthWriteEnabled: true, //default is false but for depth test we need true
            //moreover, we have format with depth component so false doesnot make a sense anywhere
            depthCompare: "less" //depth function default is all mean that depth comparision
            //always pass the test and we have less mean provided value pass the comparision test 
            //if it is less than the sampled value
        }
    });


    context.configure({
        device: device,
        format: "bgra8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    //Render attachment mean the render target texture or Framebuffer;
    //attachment mean render ratgets or framebuffers to which rendering access and write to the attachments
    //colourbuffer and depth buffer are different attachment so hee we have created depth texture which has usage of
    //render_attachment

    //good read: https://developer.samsung.com/galaxy-gamedev/resources/articles/renderpasses.html

    const depthTexture = device.createTexture({
        size: [canvas.clientWidth, canvas.clientHeight, 1],
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });


    //render pass descriptor 
    //big topic here to understand is Input Attachment
    //it is default setup in WebGl but not in Vulkan or WebGPU

    //Input Attachments are image views that can be used for pixel local load
    // operations inside a fragment shader.
    
    //This basically mean that framebuffer attachemnts written in one subpass can be read from at the exact
    //same pixel (that they have been written) in subsequent subpass

    //in each frame, we get latest swap chain image which we should write rendering outputs to and set
    // this as output color attachment so i am putting null here

    const renderPasssDescriptor = {
        colorAttachments: [{
            view: null,
            clearValue: [1.0, 1.0, 1.0, 1.0],
            loadOp: 'clear',
            storeOp: 'store'
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthStoreOp: "store",
            stencilStoreOp:"store",
            stencilLoadValue: 0
        },
        // occlusionQuerySet: EITHER AVAILABLE OR DESTROYESD WHERE QuerySet is available for GPU Operations on its content or is no longer available for any operatopms except
        //destroy - DON'T UNDERSTAND TRY THIS WHEN RENDERING VOLUME DATA OR 3D MODEL
    }
    

    function frame(){
        renderPasssDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    
        const textureWidth = 1024;
        const textureHeight = 800;        
        //to read data from the presentation texture
        const readBuffer = device.createBuffer({
            size: textureWidth*textureHeight*4,
            usage: GPUBufferUsage.MAP_READ| GPUBufferUsage.COPY_DST
        });

        let commandEncoder = device.createCommandEncoder();
        let renderPass = commandEncoder.beginRenderPass(renderPasssDescriptor);
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
