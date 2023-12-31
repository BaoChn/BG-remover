import classNames from 'classnames';
import { useMemo, useEffect, useState } from 'react';
import { ReactComponent as ChevronLeftIcon } from './icons/ChevronLeft.svg';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as SpinnerIcon } from './icons/Spinner.svg';
import { ReactComponent as UploadIcon } from './icons/Upload.svg';
import classes from './ImageMatting.module.css';
import { useImageMatting } from './ImageMattingContext';

const IMAGE_URLS = [
  {
    url: 'https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=good-faces-xmSWVeGEnJw-unsplash.jpg&w=1920',
    alt: '一位留着黑发的女人正面带微笑地看着镜头'
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=dom-hill-nimElTcTNyY-unsplash.jpg&w=1920',
    alt: '一名穿着黄色运动服的女子站在山旁的篮球场上'
  },
  {
    url: 'https://images.unsplash.com/photo-1628035514544-ebd32b766089?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=kristian-angelo-KW-jwdSgOw4-unsplash.jpg&w=1920',
    alt: '穿着黑色皮夹克的男子骑着一辆黑色摩托车'
  },
  {
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=pauline-loroy-U3aF7hgUSrk-unsplash.jpg&w=1920',
    alt: '一直棕白相间的长毛大型狗'
  },
  {
    url: 'https://images.unsplash.com/photo-1540492649367-c8565a571e4b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=andreas-m-p40QuGwGCcw-unsplash.jpg&w=1920',
    alt: '黄色陶罐上的绿色植物'
  }
];

function ImageMatting({ openEditor }) {
  const {
    imageUrl,
    originalImageUrl,
    hasProcessedImage,
    isProcessing,
    processMessage,
    resetState,
    processImage,
    inferenceTime
  } = useImageMatting();

  const [stopwatch, setStopwatch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const showUploadScreen = useMemo(() => {
    return !isProcessing && !hasProcessedImage;
  }, [isProcessing, hasProcessedImage]);

  useEffect(() => {
    let timerInstance;

    if (isProcessing) {
      timerInstance = setInterval(() => {
        setStopwatch((time) => time + 0.01);
      }, 10);
    } else {
      clearInterval(timerInstance);
      setStopwatch(0);
    }

    return () => clearInterval(timerInstance);
  }, [isProcessing, processMessage, isProcessing]);

  return (
    <div className={classes.block}>
      {hasProcessedImage && (
        <div>
          <button className={classes.ghost} onClick={() => resetState()}>
            <ChevronLeftIcon /> <span>收拾下一张</span>
          </button>
        </div>
      )}

      <div
        className={classNames(classes.preview, {
          [classes.dragging]: isDragging
        })}
        onDragLeave={(e) => {
          if (!showUploadScreen) return;

          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDragEnter={(e) => {
          if (!showUploadScreen) return;

          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          if (!showUploadScreen) return;

          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDrop={(e) => {
          if (!showUploadScreen) return;

          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          let draggedData = e.dataTransfer;
          let [file] = draggedData.files;
          const objectURL = URL.createObjectURL(file);

          processImage(objectURL);
        }}
      >
        {isProcessing && (
          <img
            className={classNames(classes.imagePreview, classes.blurred)}
            style={{
              opacity: 1
            }}
            src={originalImageUrl}
            alt={'Uploaded Image'}
          />
        )}

        {hasProcessedImage && (
          <>
            <img
              className={classNames(classes.imagePreview, {
                [classes.blurred]: isProcessing
              })}
              style={{
                opacity: 1
              }}
              src={imageUrl}
              alt={'Processed Image'}
              id={'Processed'}
              crossOrigin={'anonymous'}
            />
            <a className={classes.primary} align={'center'}>
              右键／长按保存上方图像
            </a>
            <button className={classes.primary} onClick={() => openEditor()}>
              <EditIcon /> 进一步修图
            </button>
          </>
        )}

        {!isProcessing && !hasProcessedImage && (
          <div className={classes.uploadControls}>
            <UploadIcon />
            <label className={classes.upload}>
              选择待处理的图片
              <input
                className={classes.hidden}
                type="file"
                onChange={(event) => {
                  const [file] = event.target.files;
                  const objectURL = URL.createObjectURL(file);

                  processImage(objectURL);
                }}
                accept="image/png, image/jpeg"
              />
            </label>
            <small className={classes.filetypeNotice}>支持 PNG 与 JPEG 格式</small>
          </div>
        )}

        {isProcessing && processMessage && (
          <div className={classes.processingOverlay}>
            <SpinnerIcon />
            <p className={classes.processMessage}>{processMessage}</p>
            {isProcessing && (
              <p className={classes.processStatus}>
                {stopwatch.toFixed(2) + 's'}
                {inferenceTime !== 0 && '/' + inferenceTime.toFixed(2) + 's'}
              </p>
            )}
          </div>
        )}
      </div>
      {showUploadScreen && (
        <div className={classes.sampleImagesWrapper}>
          <span>也可尝试以下样图：</span>

          <div className={classes.sampleImages}>
            {IMAGE_URLS.map(({ url, alt }) => (
              <button
                key={url}
                className={classes.sampleImage}
                onClick={() => {
                  processImage(url);
                }}
              >
                <img src={url} alt={alt} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageMatting;
