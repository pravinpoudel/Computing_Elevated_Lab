function gotToFallback(){
    console.warn("webgpu is not supported in your browser !!!");
    return true;
}

//option like powerprefernence
let options = {
    powerPreference: "high-performance"
}

( async function(){
    const adapter = await navigator.gpu.requestAdapter(options);
    //it never reject the promise so check for null 
    if(!adapter)
        return gotToFallback();

    const texture = getTheRenderedTexture();

    const readBackTexture = device.createBuffer({
        size: textureWidth*textureHeight*4,
        usage: GPUBufferUsage.MAP_READ| GPUBufferUsage.COPY_DST
    });

    const encoder = device.createCommandEncoder();
    //source, destination, copySize; remember no offset unlike Buffer to Buffer copy operation

    const myCopyTexture = {texture} // other specs are origin, mipLevel, aspect which are by default of {}, 0, "all" 
    //(empty object in origin 3D GPU Cord mean 0 in each vector/object)
    //For texture related copy operationWebGPU provides CoptBufferToTexture(), CopyTextureToBuffer and writeTexture (to write array buffer to texture)

    encoder.copyTextureToBuffer(
        {texture},
        {buffer, bytesPerRow: textureWidth*4, rowsPerImage: textureHeight*4},
        [textureWidth, textureWidth] // it can be sequence>GPUIntegerCordinate> or GPUExtent3DDict : wIFTH, hEIGHT, and/or depthOrArrayLayers with default 
        //to 1 and 1 for last two parameter
        );
        
    device.submit([encoder.finish()]); //same as commands = encoder.finish()
    //you can have multiple encoder like copyEncoder and drawEncoder (submit all the copies and then all the draws/ copies will happen before the draw such that each draw
    //will use the data that was intended to use)

    // for such case we make two encoder let's say copyEncoder and drawEncoder and use it as
    // device.queue.submit([
    //     copyEncoder.finish(),
    //     drawEncoder.finish()
    // ]);
    
    await buffer.mapAsync(GPUMapMode.READ);
    saveScreenshot(buffer.getMappedRange());
    buffer.unmap();

}());

//GPU Buffer or GPU Texture
