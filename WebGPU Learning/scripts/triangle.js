async (function(){
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    if(!device){
        return gotToFallback();
    }

    let vertexBuffer = device.createBuffer({
        size: 3*2*4,
        type: GPUBufferUsage.VERTEX_BUFFER | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    });

    let mappingArray = new Float32Array(vertexBuffer.getMappedRange());
    mappingArray.set([1.0, 0.0, 0.0, 1.0, -1.0, -1.0]);

    //to read data from the presentation texture
    const readBuffer = device.createBuffer({
        size: textureWidth*textureHeight*4,
        usage: GPUBufferUsage.MAP_READ| GPUBufferUsage.COPY_DST
    });

    //GpuPipelineLayout defines the mapping between resources of all GPUBindGroup objects 
    //setup dduring command encoding in setBindGroup and setPipeLine
    
    const trianglePipeline = device.createRenderPipeline({
        layout: 
        vertex:{
            module:{

            },
            entryPoint:,
            buffer:[]

        },

        fragment:{

        },

        primitive: "line-strip",
        depthStensil:
    });

    const encoder = device.createCommandEncoder();



})()
