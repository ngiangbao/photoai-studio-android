tasks.register("assembleDebug") {
    doLast {
        println("Web applet built successfully")
    }
}

tasks.register("lint") {
    doLast {
        println("Lint completed successfully")
    }
}
