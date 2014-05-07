# Cakefile for PongMO. Just compiles the game.

{exec} = require 'child_process'

compile = (err, stdout, stderr) ->
  console.log stdout + stderr

task 'build', 'build the game', (options) ->
  exec 'coffee -b -c -o . source/app.coffee', (err, stdout, stderr) ->
    console.log stdout+stderr
  exec 'coffee -b -c -o client/ source/game.coffee', (err, stdout, stderr) ->
    console.log stdout+stderr
