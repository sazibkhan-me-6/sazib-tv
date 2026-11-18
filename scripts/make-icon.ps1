Add-Type -AssemblyName System.Drawing
$width = 256
$height = 256
$bmp = [System.Drawing.Bitmap]::new($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Background
$rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
$brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 12, 18, 38),
    [System.Drawing.Color]::FromArgb(255, 6, 8, 18),
    45.0
)
$g.FillRectangle($brush, $rect)

# Draw glowing TV frame
$tvPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 79, 128, 255), 8)
$tvBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(32, 48, 192, 140),
    [System.Drawing.Color]::FromArgb(255, 18, 28, 58),
    [System.Drawing.Color]::FromArgb(255, 42, 28, 80),
    135.0
)

# TV screen rounded box
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
$radius = 24
$path.AddArc(32, 48, $radius, $radius, 180, 90)
$path.AddArc(32 + 192 - $radius, 48, $radius, $radius, 270, 90)
$path.AddArc(32 + 192 - $radius, 48 + 140 - $radius, $radius, $radius, 0, 90)
$path.AddArc(32, 48 + 140 - $radius, $radius, $radius, 90, 90)
$path.CloseFigure()

$g.FillPath($tvBrush, $path)
$g.DrawPath($tvPen, $path)

# TV Antennas
$antPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 168, 85, 247), 6)
$antPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$antPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($antPen, 96, 48, 64, 20)
$g.DrawLine($antPen, 160, 48, 192, 20)

# TV Stand
$standPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 79, 128, 255), 6)
$standPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$standPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($standPen, 100, 192, 80, 224)
$g.DrawLine($standPen, 156, 192, 176, 224)

# Vibrant "S" letter in center
$font = [System.Drawing.Font]::new("Arial", 58, [System.Drawing.FontStyle]::Bold)
$sBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(90, 75, 80, 80),
    [System.Drawing.Color]::FromArgb(255, 61, 110, 248),
    [System.Drawing.Color]::FromArgb(255, 236, 72, 153),
    45.0
)
$format = [System.Drawing.StringFormat]::new()
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("S", $font, $sBrush, 128, 118, $format)

# LIVE red dot badge
$badgeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 59, 92))
$g.FillEllipse($badgeBrush, 185, 62, 18, 18)

$outDir = Join-Path $PSScriptRoot "..\public"
$pngPath = Join-Path $outDir "icon.png"
$icoPath = Join-Path $outDir "icon.ico"

$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::OpenWrite($icoPath)
$icon.Save($fs)
$fs.Close()
$bmp.Dispose()
$g.Dispose()

Write-Host "Sazib TV Icons successfully generated!"
