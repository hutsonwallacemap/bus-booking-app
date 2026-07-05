# Lightweight PowerShell Web Server
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server successfully started. Listening on http://localhost:$port/"
} catch {
    Write-Host "Failed to start listener on port $port. It may already be in use or requires elevation."
    exit 1
}

$basePath = (Get-Item .).FullName

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get the relative path
        $urlPath = $request.RawUrl.Split('?')[0]
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # Security: strip path traversal dots
        $cleanUrlPath = $urlPath.Replace("..", "")
        $filePath = Join-Path $basePath $cleanUrlPath

        if (Test-Path $filePath -PathType Leaf) {
            # Set content type header
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            switch ($extension) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".htm"  { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "text/javascript; charset=utf-8" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".ico"  { $contentType = "image/x-icon" }
            }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.Close()
    } catch {
        # Silent fail for closed connections
        if ($response) {
            try { $response.Close() } catch {}
        }
    }
}
$listener.Close()
