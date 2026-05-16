import pptxgen from "pptxgenjs";
import fs from "fs";

export async function generatePPT(data) {

    const pptx = new pptxgen();

    pptx.layout = "LAYOUT_WIDE";

    data.slides.forEach((slideData, index) => {

        const slide = pptx.addSlide();

        // background
        slide.background = {
            color: "F8FAFC"
        };

        // top banner
        slide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.3,
            h: 0.6,
            fill: {
                color: "2563EB"
            },
            line: {
                color: "2563EB"
            }
        });

        // title
        slide.addText(slideData.title, {
            x: 0.5,
            y: 0.15,
            w: 10,
            h: 0.3,
            fontSize: 24,
            bold: true,
            color: "FFFFFF"
        });

        // content box
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: 1,
            w: 12,
            h: 4.8,
            radius: 0.1,
            fill: {
                color: "FFFFFF"
            },
            line: {
                color: "D1D5DB"
            }
        });

        // bullets
        slide.addText(
            slideData.bullets.map((b) => ({
                text: b,
                options: {
                    bullet: { indent: 18 }
                }
            })),
            {
                x: 1,
                y: 1.4,
                w: 10.5,
                h: 3.8,
                fontSize: 20,
                color: "1E293B",
                breakLine: true
            }
        );

        // footer
        slide.addText(`Savra AI • Slide ${index + 1}`, {
            x: 0.5,
            y: 6.9,
            w: 3,
            h: 0.2,
            fontSize: 10,
            color: "64748B"
        });
    });

    // create outputs folder if not exists
    if (!fs.existsSync("outputs")) {
        fs.mkdirSync("outputs");
    }

    const filename = `ppt-${Date.now()}.pptx`;

    const filepath = `outputs/${filename}`;

    await pptx.writeFile({
        fileName: filepath
    });

    return {
        filename,
        filepath,
        downloadUrl: `/${filepath}`
    };
}