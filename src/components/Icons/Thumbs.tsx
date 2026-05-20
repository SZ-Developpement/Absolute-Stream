import { ComponentPropsWithRef } from "react";

export const Thumbs = (
  props: ComponentPropsWithRef<"svg"> & { size?: number; color?: string },
) => {
  return (
    <svg
      width={props.size || 800}
      height={props.size || 800}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3657 0.888071C12.6127 0.352732 13.1484 0 13.75 0C14.9922 0 15.9723 0.358596 16.4904 1.29245C16.7159 1.69889 16.8037 2.13526 16.8438 2.51718C16.8826 2.88736 16.8826 3.28115 16.8826 3.62846L16.8825 7H20.0164C21.854 7 23.2408 8.64775 22.9651 10.4549L21.5921 19.4549C21.3697 20.9128 20.1225 22 18.6434 22H8L8 9H8.37734L12.3657 0.888071Z"
        fill={props.color || "#000000"}
      />
      <path
        d="M6 9H3.98322C2.32771 9 1 10.3511 1 12V19C1 20.6489 2.32771 22 3.98322 22H6L6 9Z"
        fill={props.color || "#000000"}
      />
    </svg>
  );
};

export const ThumbsDown = (
  props: ComponentPropsWithRef<"svg"> & { size?: number; color?: string },
) => {
  return (
    <svg
      width={props.size || 800}
      height={props.size || 800}
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_526_1383)">
        <path
          d="M387.81 770.398C379.576 788.242 361.72 800 341.666 800C300.26 800 267.59 788.047 250.32 756.918C242.803 743.37 239.876 728.825 238.54 716.094C237.246 703.755 237.246 690.628 237.246 679.051L237.25 566.667H132.786C71.533 566.667 25.3064 511.742 34.4964 451.503L80.263 151.503C87.6764 102.907 129.25 66.6667 178.553 66.6667L533.333 66.6667L533.333 500H520.755L387.81 770.398Z"
          fill={props.color || "#000000"}
        />
        <path
          d="M600 500H667.226C722.41 500 766.667 454.963 766.667 400L766.667 166.667C766.667 111.703 722.41 66.6667 667.226 66.6667H600L600 500Z"
          fill={props.color || "#000000"}
        />
      </g>
      <defs>
        <clipPath id="clip0_526_1383">
          <rect
            width="800"
            height="800"
            fill="white"
            transform="matrix(-1 0 0 -1 800 800)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
