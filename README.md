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
    - [x] tetrahedron
    - [x] octahedron
    - [x] cube
    - [x] dodecahedron
    - [x] icosahedron
    - [ ] more?
- [x] basic ts config setup
- [x] basic github pages setup
- [x] basic 3d webgl skeleton
- [x] function to triangulate a mesh to the center of faces
- [x] function to subdivide triangular faces to a precision N (powers of 2?)
- [x] function to lerp vertices towards a sphere
- [ ] somehow encode the fundamental domains for each mesh
- [x] timer for animation
- [x] ui buttons for mesh selection
- [ ] render transparently on top of a background image