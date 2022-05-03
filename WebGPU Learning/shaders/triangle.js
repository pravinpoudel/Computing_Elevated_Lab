const V_S_triangle = `

struct Vertex{
    @location(0) position: vec2<f32>,
    @location(1) color: vec4<f32>
}

struct VertexOutPut{
    @builtin(position) position: vec4<f32>,
    @location(0) uv_position: vec2<f32>,
    @location(1) color: vec4<f32>,
}

@stage(vertex)
fn vs_mainT(@builtin(vertex_index) vertexIndex: u32, vertices:Vertex )-> VertexOutPut{
    var out:VertexOutPut;
    out.position = vec4<f32>(vertices.position, 0.0, 1.0);
    out.uv_position = (vec2<f32>(1.0, 1.0) + vertices.position)/2.0;
    out.color = vertices.color;
    return out;
}
`;


const F_S_triangle = `
@stage(fragment)
fn fs_mainT(@location(0) uv_position:vec2<f32>, @location(1) color: vec4<f32>)-> @location(0) vec4<f32>{
    return vec4<f32>(1.0, 1.0, 1.0, 1.0);
}
`;
