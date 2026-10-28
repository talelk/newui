from pathlib import Path
import subprocess
import sys
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "font-source"
OUTPUT = ROOT / "src" / "fonts" / "Inter"
SUBSETS = {
    "latin": "U+0000-02FF,U+2000-2FFF,U+FEFF,U+FFFD",
    "extended": "U+0300-1FFF,U+2C00-2FFF,U+A000-AFFF,U+E000-F8FF,U+FDFC,U+FE20-FE2D,U+1F12F-1F16B,U+1F850-1F852,U+FEFF,U+FFFD",
    "cjk": "U+4E00-9FFF,U+AC00-D7AF,U+FEFF,U+FFFD",
}

for prefix in ("Inter", "Inter-Italic"):
    source = SOURCE / f"{prefix}.var.woff2"
    for subset, unicodes in SUBSETS.items():
        output = OUTPUT / f"{prefix}-{subset}.var.woff2"
        subprocess.run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                str(source),
                "--flavor=woff2",
                f"--output-file={output}",
                f"--unicodes={unicodes}",
                "--layout-features+=tnum",
            ],
            check=True,
        )
        print(f"{output.relative_to(ROOT)}: {output.stat().st_size} bytes")

    original = TTFont(source)
    generated = [TTFont(OUTPUT / f"{prefix}-{subset}.var.woff2") for subset in SUBSETS]
    original_codepoints = set(original.getBestCmap())
    generated_codepoints = {
        codepoint for font in generated for codepoint in font.getBestCmap()
    }
    assert original_codepoints <= generated_codepoints, f"{prefix}: lost codepoints"

    original_axes = [
        (axis.axisTag, axis.minValue, axis.defaultValue, axis.maxValue)
        for axis in original["fvar"].axes
    ]
    for font in generated:
        axes = [
            (axis.axisTag, axis.minValue, axis.defaultValue, axis.maxValue)
            for axis in font["fvar"].axes
        ]
        assert axes == original_axes, f"{prefix}: variable axes changed"
        assert "gvar" in font, f"{prefix}: glyph variations missing"

    features = {
        feature.FeatureTag
        for font in generated
        for feature in font["GSUB"].table.FeatureList.FeatureRecord
    }
    assert "tnum" in features, f"{prefix}: tabular numerals missing"
    print(f"{prefix}: glyph coverage, variable axes, and tabular numerals verified")
