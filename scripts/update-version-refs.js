#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')

// Read the current version from package.json
function getCurrentVersion () {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return packageJson.version
}

// Update the version in Jekyll's _config.yml
function updateJekyllConfig (version) {
  const configPath = 'docs/_config.yml'

  if (!fs.existsSync(configPath)) {
    console.log(`Warning: File ${configPath} does not exist, skipping...`)
    return false
  }

  let content = fs.readFileSync(configPath, 'utf8')

  // Replace the version line
  const versionRegex = /^version:\s*".*"$/m
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `version: "${version}"`)
    fs.writeFileSync(configPath, content, 'utf8')
    console.log(`Updated version to ${version} in ${configPath}`)
  } else {
    // If version line doesn't exist, add it at the end
    content = content.trim() + `\nversion: "${version}"\n`
    fs.writeFileSync(configPath, content, 'utf8')
    console.log(`Added version ${version} to ${configPath}`)
  }
  return true
}

// Commit the changes
function commitChanges (version) {
  try {
    console.log('Staging Jekyll config changes...')
    execSync('git add docs/_config.yml', { stdio: 'inherit' })

    console.log('Amending the version commit...')
    execSync('git commit --amend --no-edit', { stdio: 'inherit' })

    console.log(`Successfully amended commit with Jekyll version update to ${version}`)
  } catch (error) {
    console.error('Error during git operations:', error.message)
    process.exit(1)
  }
}

// Main function
function main () {
  const version = getCurrentVersion()
  console.log(`Current version: ${version}`)
  console.log('Updating Jekyll config version...')

  const updated = updateJekyllConfig(version)

  if (updated) {
    commitChanges(version)
    console.log('Version update and commit complete!')
  } else {
    console.log('No changes made, skipping commit.')
  }
}

if (require.main === module) {
  main()
}

module.exports = { updateJekyllConfig, getCurrentVersion, commitChanges }
