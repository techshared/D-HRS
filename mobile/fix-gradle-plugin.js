// Run this script to patch React Native Gradle plugin for China mirrors
// Usage: node fix-gradle-plugin.js

const fs = require('fs');
const path = require('path');

const pluginDir = path.join(__dirname, 'node_modules', '@react-native', 'gradle-plugin');
const buildGradle = path.join(pluginDir, 'build.gradle.kts');
const settingsGradle = path.join(pluginDir, 'settings.gradle.kts');

// Patch build.gradle.kts
let buildContent = fs.readFileSync(buildGradle, 'utf8');
if (buildContent.includes('kotlin("jvm") version "1.7.22"')) {
  buildContent = buildContent.replace(
    'plugins {\n  kotlin("jvm") version "1.7.22"\n  id("java-gradle-plugin")\n}',
    `plugins {
  id("java-gradle-plugin")
}

buildscript {
    repositories {
        maven("https://maven.aliyun.com/repository/public")
        maven("https://maven.aliyun.com/repository/central")
        maven("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
        maven("https://repo.huaweicloud.com/repository/maven/")
        mavenCentral()
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.10")
    }
}

apply(plugin = "kotlin")`
  );
  fs.writeFileSync(buildGradle, buildContent);
  console.log('Patched build.gradle.kts');
} else {
  console.log('build.gradle.kts already patched');
}

// Patch settings.gradle.kts
let settingsContent = fs.readFileSync(settingsGradle, 'utf8');
if (!settingsContent.includes('maven("https://mirrors.cloud.tencent.com')) {
  settingsContent = settingsContent.replace(
    'pluginManagement {\n  repositories {',
    `pluginManagement {
  repositories {
    maven("https://maven.aliyun.com/repository/public")
    maven("https://maven.aliyun.com/repository/central")
    maven("https://maven.aliyun.com/repository/google")
    maven("https://maven.aliyun.com/repository/gradle-plugin")
    maven("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
    maven("https://mirrors.cloud.tencent.com/nexus/repository/maven-central/")
    maven("https://repo.huaweicloud.com/repository/maven/")
    maven("https://maven.pkg.jetbrains.space/public/p/kotlinx/maven")
    maven("https://cache-redirector.jetbrains.com/maven")
    maven("https://dl.google.com/dl/android/maven2/")`
  );
  settingsContent = settingsContent.replace(
    '  }\n}\n\nrootProject.name',
    `  }\n}\n\nSystem.setProperty("http.proxyHost", "")\nSystem.setProperty("http.proxyPort", "")\nSystem.setProperty("https.proxyHost", "")\nSystem.setProperty("https.proxyPort", "")\n\nrootProject.name`
  );
  fs.writeFileSync(settingsGradle, settingsContent);
  console.log('Patched settings.gradle.kts');
} else {
  console.log('settings.gradle.kts already patched');
}

console.log('Done!');
