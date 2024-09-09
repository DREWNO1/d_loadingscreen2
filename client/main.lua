local spawned = false							

AddEventHandler("playerSpawned", function () 	
	if not spawned then
		ShutdownLoadingScreen()	
		spawned = true
	end
end)