# Breathing geometry

A breathing exercise with regular polyhedra and their spherical geometries.

## Artistic checklist

- [ ] sketch the ideas of the scene
- [ ] what is the atmosphere?
- [ ] color palettes, textures
- [ ] smooth breathing animation
- [ ] rotation, bobbing, other smooth motions
- [ ] background image
- [ ] what is the experience that I want to have?

## Technical checklist

- Get a mesh for
    - [ ] tetrahedron
    - [ ] octahedron
    - [ ] cube
    - [ ] dodecahedron
    - [ ] icosahedron
    - [ ] more?
- [ ] basic ts config setup
- [ ] basic github pages setup
- [ ] basic 3d webgl skeleton
- [ ] function to triangulate a mesh to the center of faces
- [ ] function to subdivide triangular faces to a precision N (powers of 2?)
- [ ] function to lerp vertices towards a sphere
- [ ] somehow encode the fundamental domains for each mesh
- [ ] timer for animation
- [ ] ui buttons for mesh selection
- [ ] render transparently on top of a background image