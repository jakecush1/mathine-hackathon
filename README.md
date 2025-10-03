# Starting Dev Environment

1. Open 2 terminals in the mathine-hackathon directory
2. In terminal 1:
`cd fe`,
`npm install`,
`npm run dev`
3. In terminal 2:
`cd api`,
`npm install`,
`npm install --save-dev ts-node typescript`,
`npx ts-node src/index.ts`


# Simulating Users

In `api/ContainerEnv`:
- Change the `netID` environment variable to any string, and that will store data under that user.

# Making Changes

1. Make a branch:
`git checkout -b <your-branch-name>`
2. Make your changes
3. Commit and push your changes
`git add .`
`git commit -m "your commit message"`
`git push origin --set-upstream <your-branch-name>`
4. Open a pull request on GitHub
5. Merge your pull request
