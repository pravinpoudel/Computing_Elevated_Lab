const V_S_triangle = `

struct Vertex{
    [[location(0)]] position: array<f32, 6>;
}

struct VertexOutPut{
    [[builtin(position)]] position: vec4<f32>
    [[location(0)]] uv_position: vec2<f32>
}

@stage(vertex)
fn vertexMain(@builtin(vertex_index) vertexIndex: u32, )-> VertexOutPut{
    var out:VertexOutPut;
    out.position = vec4<f32>(vertex.position[2*vertexIndex], vertex.position[2*vertexIndex+1], 0.0, 1.0);
    out.uv_position = (vec2<f32>(vertex.position[2*vertexIndex], vertex.position[2*vertexIndex+1]) + vec2<f32>(1.0, 1.0))/2.0;
    return out;
}
`;




const F_S_triangle = `

[[stage(fragment)]]

fn fs_main(in:VertexOutPut)-> [[location[0]]] vec4<f32>{
    return vec4<f32> (0.3, 0.2, 0.1, 1.0);
}
`;
